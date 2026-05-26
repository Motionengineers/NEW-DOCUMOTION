"""
Dashboard API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from pydantic import BaseModel

from backend.database.connection import get_db
from .models import User, Document, DocumentType, InvestorMatch, ComplianceDeadline
from .dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# ============================================================
# SCHEMAS
# ============================================================

class DashboardStats(BaseModel):
    total_documents: int
    documents_by_type: Dict[str, int]
    expiring_documents: int
    expired_documents: int
    investor_matches: int
    pending_compliance: int
    eligible_schemes: int
    api_calls_this_month: int


class ActivityPoint(BaseModel):
    date: str
    count: int


class ActivityResponse(BaseModel):
    documents_uploaded: List[ActivityPoint]
    api_calls: List[ActivityPoint]
    investor_contacts: List[ActivityPoint]


class RecentDocument(BaseModel):
    id: int
    name: str
    type: str
    uploaded_at: str
    status: str
    expiry_date: Optional[str]


class UpcomingDeadline(BaseModel):
    id: int
    title: str
    type: str
    due_date: str
    days_remaining: int
    status: str


class InvestorMatchSchema(BaseModel):
    id: int
    investor_name: str
    match_score: float
    status: str
    contacted_at: Optional[str]


class SchemeRecommendation(BaseModel):
    id: str
    name: str
    ministry: str
    max_funding: float
    eligibility_score: float
    deadline: Optional[str]


# ============================================================
# ENDPOINTS
# ============================================================

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    
    # Document counts
    total_docs = db.query(Document).filter(Document.user_id == current_user.id).count()
    
    # Documents by type
    docs_by_type = db.query(
        Document.document_type, func.count(Document.id)
    ).filter(Document.user_id == current_user.id).group_by(Document.document_type).all()
    
    documents_by_type = {doc_type.value if doc_type else "OTHER": count for doc_type, count in docs_by_type}
    
    # Expiring documents (within 30 days)
    today = datetime.now()
    thirty_days_later = today + timedelta(days=30)
    
    expiring_docs = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.expiry_date.isnot(None),
        Document.expiry_date.between(today, thirty_days_later)
    ).count()
    
    # Expired documents
    expired_docs = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.expiry_date.isnot(None),
        Document.expiry_date < today
    ).count()
    
    # Investor matches
    investor_matches = db.query(InvestorMatch).filter(
        InvestorMatch.user_id == current_user.id,
        InvestorMatch.status == "pending"
    ).count()
    
    # Pending compliance
    pending_compliance = db.query(ComplianceDeadline).filter(
        ComplianceDeadline.user_id == current_user.id,
        ComplianceDeadline.status == "pending",
        ComplianceDeadline.due_date >= today
    ).count()
    
    # Eligible schemes (simplified - would query from RAG)
    eligible_schemes = 12  # Placeholder
    
    # API calls this month
    api_calls = current_user.api_calls_count or 0
    
    return DashboardStats(
        total_documents=total_docs,
        documents_by_type=documents_by_type,
        expiring_documents=expiring_docs,
        expired_documents=expired_docs,
        investor_matches=investor_matches,
        pending_compliance=pending_compliance,
        eligible_schemes=eligible_schemes,
        api_calls_this_month=api_calls
    )


@router.get("/activity", response_model=ActivityResponse)
async def get_activity(
    days: int = Query(30, ge=1, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user activity over time"""
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Document upload activity
    doc_activity = db.query(
        func.date(Document.created_at).label("date"),
        func.count(Document.id).label("count")
    ).filter(
        Document.user_id == current_user.id,
        Document.created_at >= start_date
    ).group_by(func.date(Document.created_at)).all()
    
    documents_uploaded = [
        ActivityPoint(date=str(row.date), count=row.count)
        for row in doc_activity
    ]
    
    # Investor contact activity
    contact_activity = db.query(
        func.date(InvestorMatch.contacted_at).label("date"),
        func.count(InvestorMatch.id).label("count")
    ).filter(
        InvestorMatch.user_id == current_user.id,
        InvestorMatch.contacted_at.isnot(None),
        InvestorMatch.contacted_at >= start_date
    ).group_by(func.date(InvestorMatch.contacted_at)).all()
    
    investor_contacts = [
        ActivityPoint(date=str(row.date), count=row.count)
        for row in contact_activity
    ]
    
    return ActivityResponse(
        documents_uploaded=documents_uploaded,
        api_calls=[],  # Would come from API logs
        investor_contacts=investor_contacts
    )


@router.get("/documents/recent", response_model=List[RecentDocument])
async def get_recent_documents(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent documents"""
    
    documents = db.query(Document).filter(
        Document.user_id == current_user.id
    ).order_by(Document.created_at.desc()).limit(limit).all()
    
    return [
        RecentDocument(
            id=doc.id,
            name=doc.filename,
            type=doc.document_type.value if doc.document_type else "OTHER",
            uploaded_at=doc.created_at.isoformat(),
            status=doc.status,
            expiry_date=doc.expiry_date.isoformat() if doc.expiry_date else None
        )
        for doc in documents
    ]


@router.get("/compliance/upcoming", response_model=List[UpcomingDeadline])
async def get_upcoming_deadlines(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get upcoming compliance deadlines"""
    
    today = datetime.now()
    
    deadlines = db.query(ComplianceDeadline).filter(
        ComplianceDeadline.user_id == current_user.id,
        ComplianceDeadline.status == "pending",
        ComplianceDeadline.due_date >= today
    ).order_by(ComplianceDeadline.due_date.asc()).limit(limit).all()
    
    return [
        UpcomingDeadline(
            id=d.id,
            title=d.title,
            type=d.deadline_type,
            due_date=d.due_date.isoformat(),
            days_remaining=(d.due_date - today).days,
            status="pending"
        )
        for d in deadlines
    ]


@router.get("/investors/matches", response_model=List[InvestorMatchSchema])
async def get_investor_matches(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get investor matches"""
    
    matches = db.query(InvestorMatch).filter(
        InvestorMatch.user_id == current_user.id
    ).order_by(InvestorMatch.match_score.desc()).limit(limit).all()
    
    return [
        InvestorMatchSchema(
            id=m.id,
            investor_name=m.investor_name,
            match_score=m.match_score,
            status=m.status,
            contacted_at=m.contacted_at.isoformat() if m.contacted_at else None
        )
        for m in matches
    ]


@router.get("/schemes/recommendations", response_model=List[SchemeRecommendation])
async def get_scheme_recommendations(
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get scheme recommendations (from RAG)"""
    
    # This would call the RAG pipeline
    # For now, return placeholder
    
    return [
        SchemeRecommendation(
            id="1",
            name="Startup India Seed Fund Scheme",
            ministry="DPIIT",
            max_funding=5000000,
            eligibility_score=95,
            deadline="2024-12-31"
        ),
        SchemeRecommendation(
            id="2",
            name="MSME Business Loan",
            ministry="MSME",
            max_funding=10000000,
            eligibility_score=88,
            deadline=None
        ),
        SchemeRecommendation(
            id="3",
            name="Karnataka Elevate Program",
            ministry="Karnataka Govt",
            max_funding=2500000,
            eligibility_score=82,
            deadline="2024-11-30"
        )
    ][:limit]