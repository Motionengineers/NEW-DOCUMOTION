import prisma from '@/lib/prisma';

function parseCommaSeparated(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(entry => entry.trim())
      .filter(Boolean);
  }
  return [];
}

function parseJsonString(value) {
  if (!value) return null;
  if (Array.isArray(value) || typeof value === 'object') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function transformAgency(
  agency,
  { includeServices = false, includePortfolio = false, includeReviews = false } = {}
) {
  if (!agency) return null;

  return {
    id: agency.id,
    slug: agency.slug,
    name: agency.name,
    city: agency.city,
    state: agency.state,
    location: agency.location,
    country: agency.country,
    logoUrl: agency.logoUrl,
    bannerUrl: agency.bannerUrl,
    website: agency.website,
    instagram: agency.instagram,
    linkedin: agency.linkedin,
    youtube: agency.youtube,
    twitter: agency.twitter,
    contactEmail: agency.contactEmail,
    contactPhone: agency.contactPhone,
    description: agency.description,
    rating: agency.rating,
    ratingCount: agency.ratingCount,
    reviewCount: agency.reviewCount,
    minBudget: agency.minBudget,
    maxBudget: agency.maxBudget,
    currency: agency.currency,
    verified: agency.verified,
    verifiedAt: agency.verifiedAt,
    featured: agency.featured,
    expertiseTags: parseCommaSeparated(agency.expertiseTags),
    categories: parseCommaSeparated(agency.categories),
    industries: parseCommaSeparated(agency.industries),
    serviceBadges:
      parseCommaSeparated(agency.serviceBadges) || parseJsonString(agency.services) || [],
    teamSize: agency.teamSize ?? agency.employees ?? null,
    yearsExperience: agency.yearsExperience ?? null,
    responseTime: agency.responseTime ?? null,
    foundedYear: agency.foundedYear ?? null,
    services: includeServices
      ? (agency.servicesOffered?.map(service => ({
          id: service.id,
          name: service.name,
          category: service.category,
          description: service.description,
          deliveryType: service.deliveryType,
          minTimeline: service.minTimeline,
          maxTimeline: service.maxTimeline,
          startingPrice: service.startingPrice,
          currency: service.currency,
          isPrimary: service.isPrimary,
        })) ?? [])
      : undefined,
    portfolio: includePortfolio
      ? (agency.portfolios?.map(item => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          description: item.description,
          mediaType: item.mediaType,
          mediaUrl: item.mediaUrl,
          thumbnailUrl: item.thumbnailUrl,
          caseStudyUrl: item.caseStudyUrl,
          clientName: item.clientName,
          industry: parseCommaSeparated(item.industry),
          year: item.year,
          tags: parseCommaSeparated(item.tags),
        })) ?? [])
      : undefined,
    reviews: includeReviews
      ? (agency.reviews
          ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map(review => ({
            id: review.id,
            authorName: review.authorName,
            authorRole: review.authorRole,
            company: review.company,
            projectType: review.projectType,
            rating: review.rating,
            headline: review.headline,
            comment: review.comment,
            response: review.response,
            respondedAt: review.respondedAt,
            createdAt: review.createdAt,
          })) ?? [])
      : undefined,
  };
}

export async function listAgencies({
  take = 24,
  skip = 0,
  filters = {},
  includeServices = false,
  includePortfolio = false,
} = {}) {
  const where = {};
  const orFilters = [];

  if (filters.city?.length) {
    where.city = { in: Array.isArray(filters.city) ? filters.city : [filters.city] };
  }

  if (filters.state?.length) {
    where.state = { in: Array.isArray(filters.state) ? filters.state : [filters.state] };
  }

  if (filters.services && filters.services.length) {
    const serviceList = Array.isArray(filters.services) ? filters.services : [filters.services];
    where.servicesOffered = {
      some: {
        name: { in: serviceList },
      },
    };
  }

  if (filters.categories?.length) {
    filters.categories.forEach(category => {
      orFilters.push({
        categories: {
          contains: category,
        },
      });
    });
  }

  if (filters.query) {
    const query = filters.query.trim();
    if (query) {
      orFilters.push(
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { expertiseTags: { contains: query, mode: 'insensitive' } }
      );
    }
  }

  if (filters.verified !== undefined) {
    where.verified = filters.verified;
  }

  if (filters.minRating) {
    where.rating = { gte: filters.minRating };
  }

  if (filters.minBudget || filters.maxBudget) {
    if (filters.minBudget) {
      where.minBudget = { gte: filters.minBudget };
    }
    if (filters.maxBudget) {
      where.maxBudget = { lte: filters.maxBudget };
    }
  }

  if (filters.teamSizeBands?.length) {
    const bandFilters = filters.teamSizeBands.map(band => {
      if (band === '1-10') {
        return { teamSize: { gte: 1, lte: 10 } };
      }
      if (band === '10-50') {
        return { teamSize: { gte: 10, lte: 50 } };
      }
      if (band === '50+') {
        return { teamSize: { gte: 50 } };
      }
      return null;
    });
    const validBands = bandFilters.filter(Boolean);
    if (validBands.length) {
      where.AND = [
        ...(where.AND ?? []),
        {
          OR: validBands,
        },
      ];
    }
  }

  if (orFilters.length) {
    where.OR = [...(where.OR ?? []), ...orFilters];
  }

  const [total, data] = await Promise.all([
    prisma.agency.count({ where }),
    prisma.agency.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { rating: 'desc' }, { reviewCount: 'desc' }, { name: 'asc' }],
      take,
      skip,
      include: {
        servicesOffered: includeServices,
        portfolios: includePortfolio,
      },
    }),
  ]);

  return {
    total,
    agencies: data.map(agency => transformAgency(agency, { includeServices, includePortfolio })),
  };
}

export async function getAgencyBySlug(
  slug,
  { includeServices = true, includePortfolio = true, includeReviews = true } = {}
) {
  const agency = await prisma.agency.findUnique({
    where: { slug },
    include: {
      servicesOffered: includeServices,
      portfolios: includePortfolio,
      reviews: includeReviews,
    },
  });

  return transformAgency(agency, { includeServices, includePortfolio, includeReviews });
}

export async function getAgencyById(
  id,
  { includeServices = true, includePortfolio = true, includeReviews = false } = {}
) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return null;
  }

  const agency = await prisma.agency.findUnique({
    where: { id: numericId },
    include: {
      servicesOffered: includeServices,
      portfolios: includePortfolio,
      reviews: includeReviews,
    },
  });

  return transformAgency(agency, { includeServices, includePortfolio, includeReviews });
}

export async function listAgencyFilters() {
  const [cities, states, services, categories] = await Promise.all([
    prisma.agency.findMany({
      where: { city: { not: null } },
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' },
    }),
    prisma.agency.findMany({
      where: { state: { not: null } },
      select: { state: true },
      distinct: ['state'],
      orderBy: { state: 'asc' },
    }),
    prisma.agencyService.findMany({
      select: { name: true },
      distinct: ['name'],
      orderBy: { name: 'asc' },
    }),
    prisma.agency.findMany({
      where: { categories: { not: null } },
      select: { categories: true },
    }),
  ]);

  const categorySet = new Set();
  categories.forEach(entry => {
    parseCommaSeparated(entry.categories).forEach(categorySet.add, categorySet);
  });

  return {
    cities: cities.map(entry => entry.city),
    states: states.map(entry => entry.state),
    services: services.map(entry => entry.name),
    categories: Array.from(categorySet).sort((a, b) => a.localeCompare(b)),
  };
}
