"""
Advanced scoring algorithms for investor matching
"""

import numpy as np
from typing import Dict, List, Tuple

class MatchScorer:
    """Advanced match scoring with multiple factors"""
    
    @staticmethod
    def calculate_sector_score(startup_sector: str, investor_sectors: List[str]) -> Tuple[int, str]:
        """Calculate sector match score (0-25)"""
        startup_sector_lower = startup_sector.lower()
        investor_sectors_lower = [s.lower() for s in investor_sectors]
        
        # Exact match
        if startup_sector_lower in investor_sectors_lower:
            return 25, "Exact sector match"
        
        # Partial match
        for sector in investor_sectors_lower:
            if sector in startup_sector_lower or startup_sector_lower in sector:
                return 15, f"Related sector: {sector}"
        
        # No match but broad investor
        if not investor_sectors:
            return 10, "Investor open to all sectors"
        
        return 0, f"Focuses on different sectors: {', '.join(investor_sectors[:3])}"
    
    @staticmethod
    def calculate_stage_score(startup_stage: str, investor_stages: List[str]) -> Tuple[int, str]:
        """Calculate stage match score (0-20)"""
        startup_stage_lower = startup_stage.lower()
        investor_stages_lower = [s.lower() for s in investor_stages]
        
        # Stage mapping for progression
        stage_order = ["idea", "pre-seed", "seed", "series a", "series b", "series c", "growth"]
        
        if startup_stage_lower in investor_stages_lower:
            return 20, "Exact stage match"
        
        # Check if investor invests in earlier stage (can move up)
        if startup_stage_lower in stage_order:
            startup_idx = stage_order.index(startup_stage_lower)
            for stage in investor_stages_lower:
                if stage in stage_order and stage_order.index(stage) <= startup_idx:
                    return 15, f"Investor typically invests in {stage} (can move to your stage)"
        
        if not investor_stages:
            return 10, "Investor open to various stages"
        
        return 5, f"Focuses on: {', '.join(investor_stages[:2])}"
    
    @staticmethod
    def calculate_ticket_score(ask_amount: int, ticket_range: Dict) -> Tuple[int, str]:
        """Calculate ticket size match score (0-20)"""
        min_ticket = ticket_range.get('min', 0)
        max_ticket = ticket_range.get('max', float('inf'))
        
        if min_ticket <= ask_amount <= max_ticket:
            return 20, "Ask amount within investor's range"
        elif ask_amount < min_ticket:
            ratio = ask_amount / min_ticket if min_ticket > 0 else 1
            score = max(5, int(20 * ratio))
            return score, f"Ask is {ratio:.0%} of minimum check size"
        else:
            ratio = max_ticket / ask_amount if max_ticket != float('inf') else 1
            score = max(5, int(20 * ratio))
            return score, f"Ask is larger than typical check size"
    
    @staticmethod
    def calculate_location_score(startup_location: str, investor_locations: List[str]) -> Tuple[int, str]:
        """Calculate location match score (0-15)"""
        startup_location_lower = startup_location.lower()
        
        # Exact location match
        if startup_location_lower in [l.lower() for l in investor_locations]:
            return 15, "Based in your city"
        
        # Regional match
        regions = {
            "south": ["bangalore", "chennai", "hyderabad", "kochi"],
            "west": ["mumbai", "pune", "ahmedabad"],
            "north": ["delhi", "gurgaon", "noida", "chandigarh"],
            "east": ["kolkata", "bhubaneswar"]
        }
        
        for region, cities in regions.items():
            if startup_location_lower in cities:
                for loc in investor_locations:
                    if loc.lower() in cities:
                        return 12, f"Active in {region.title()} India"
        
        # Pan India or global
        if any("pan india" in l.lower() or "global" in l.lower() for l in investor_locations):
            return 10, "Has pan-India presence"
        
        if not investor_locations:
            return 8, "Location not specified"
        
        return 5, "Different location"
    
    @staticmethod
    def calculate_portfolio_score(startup_desc: str, portfolio: List[str]) -> Tuple[int, str]:
        """Calculate portfolio overlap score (0-10)"""
        if not portfolio:
            return 5, "Portfolio information not available"
        
        startup_desc_lower = startup_desc.lower()
        
        # Check for industry matches in portfolio
        matched = []
        for company in portfolio:
            company_lower = company.lower()
            if company_lower in startup_desc_lower:
                matched.append(company)
        
        if matched:
            return 10, f"Portfolio includes similar companies: {', '.join(matched[:2])}"
        
        return 3, "Different portfolio focus"
    
    @staticmethod
    def calculate_complete_score(startup: Dict, investor: Dict) -> Dict:
        """Calculate complete match score with all factors"""
        scores = {}
        
        # Sector score
        sector_score, sector_reason = MatchScorer.calculate_sector_score(
            startup.get('sector', ''),
            investor.get('focus_sectors', [])
        )
        scores['sector'] = {'score': sector_score, 'reason': sector_reason}
        
        # Stage score
        stage_score, stage_reason = MatchScorer.calculate_stage_score(
            startup.get('stage', ''),
            investor.get('stages', [])
        )
        scores['stage'] = {'score': stage_score, 'reason': stage_reason}
        
        # Ticket score
        ticket_score, ticket_reason = MatchScorer.calculate_ticket_score(
            startup.get('ask_amount', 0),
            investor.get('ticket_size', {})
        )
        scores['ticket'] = {'score': ticket_score, 'reason': ticket_reason}
        
        # Location score
        location_score, location_reason = MatchScorer.calculate_location_score(
            startup.get('location', ''),
            investor.get('location', [])
        )
        scores['location'] = {'score': location_score, 'reason': location_reason}
        
        # Portfolio score
        portfolio_score, portfolio_reason = MatchScorer.calculate_portfolio_score(
            startup.get('description', ''),
            investor.get('portfolio', [])
        )
        scores['portfolio'] = {'score': portfolio_score, 'reason': portfolio_reason}
        
        # Calculate total
        total = sum(s['score'] for s in scores.values())
        
        return {
            'total_score': total,
            'max_possible': 90,
            'percentage': round((total / 90) * 100, 2),
            'breakdown': scores
        }