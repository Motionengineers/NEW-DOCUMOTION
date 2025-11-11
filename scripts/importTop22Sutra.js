/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

const TOP22 = [
  { name: 'Crayons Advertising', website: 'https://crayonad.com', phone: '+91 11 621 2347', email: 'del@crayonad.com', services: 'Brand management, branding, film & print production, events/activation, digital, media, OOH', clients: 'LLADRO, SBI, Air India, Delhi Police, Indira IVF, J&K Tourism, Kajaria' },
  { name: 'Havas Worldwide India', website: 'https://in.havas.com', phone: '+91 22 493 7188', email: null, services: 'Integrated marketing communications, advertising, digital', clients: 'HDFC Securities, Pacific Online, Rolta, Weekender, Torrent Pharma' },
  { name: 'Digital Piloto Pvt. Ltd.', website: 'https://digitalpiloto.com', phone: '+91 8910457310', email: 'info@digitalpiloto.com', services: 'SEO, link building, content, PPC, social, ORM', clients: 'VR Group Hotels, Immigration Advisers NZ, Aquays Hotels, Vidhikarya, Hako' },
  { name: 'Intent Farm', website: 'https://intentfarm.com', phone: '08047362908', email: 'hello@intentfarm.com', services: 'Google Ads, SEO, content, email, performance marketing', clients: 'upGrad, Groww, purple, ICICI, Paytm, Kotak, Flipkart, Dabur' },
  { name: 'JWT India', website: 'https://www.wundermanthompson.com', phone: null, email: 'mike.khanna@jwt.com', services: 'Brand building, digital transformation, social, activation, internal communications', clients: 'Apollo Hospital, DSP Merrill Lynch, Hero Honda, Standard Chartered, Pepsi Foods' },
  { name: 'Hakuhodo Percept', website: 'https://www.hakuhodo-global.com', phone: '+91 11 628 8870', email: 'hakuhododelhi@hakuhodopercept.com', services: 'Advertising, marketing, media buying', clients: 'Tresmode, FedEx Express, Syska, Reliance, Vivanta' },
  { name: 'Jelitta Publicity', website: null, phone: '+91 481 564 075', email: null, services: 'Research, strategy, creative, media planning', clients: 'Asianet, South Indian Bank, Apollo Gold, Zella Diamonds' },
  { name: 'Lowe Lintas', website: 'https://www.lowelintas.in', phone: '+91 22 202 1577', email: null, services: 'Brand communication, campaign management, multimedia production', clients: 'Axis Bank, Bajaj, Britannia, HUL, Maruti Suzuki, Micromax, Tata Tea' },
  { name: 'Seagull Advertising', website: 'https://seagulladvertising.com', phone: '+91 9810221920', email: 'adri@seagulladvertising.org', services: '360° advertising & brand consulting', clients: 'Playtor, Tokri, Mantra, Clearskin, HSBC, Thermax' },
  { name: 'Red Fuse Communications', website: 'https://www.redfuse.com', phone: '+91 22 4239 8999', email: 'info@redfuse.com', services: 'Digital-first full-service, global', clients: 'Colgate, Palmolive, Hill’s Science Diet' },
  { name: 'Aquarius Promotions', website: 'https://www.aquariusppl.com', phone: '+91 755 4222442', email: 'info@aquariusppl.com', services: 'Print, electronic, outdoor, branding, media planning/buying, events, web', clients: 'LIC of India, Dainik Bhaskar Group, Ernst & Young India' },
  { name: 'Urja Communications', website: 'https://www.urja.com', phone: '+91 22 40715700', email: 'info@urja.com', services: 'Digital & email marketing, UI/UX, social media, content', clients: 'NIIT, Axis Bank, Ford, ICICI, Shoppers Stop' },
  { name: 'Grey India', website: 'https://grey.com/india', phone: '+91 22 40366363', email: 'vineet.singh@grey.com', services: 'Integrated advertising', clients: 'Sensodyne, Dell, Indian Air Force, Cadbury Silk' },
  { name: 'Carat', website: 'https://www.carat.com', phone: '+91 22 3024 8100', email: 'kartik.iyer@carat.com', services: 'Media network, communications strategy, buying, partnerships, content, mobile, SEM, social', clients: 'Chevrolet, Adidas, Cadbury, General Motors' },
  { name: 'Avail Advertising', website: 'https://availadvertising.org', phone: '+91 9890999839', email: 'info@availadvertising.org', services: 'Branding, design, digital, SMM, SEO, ATL/BTL', clients: 'Atlas Copco, TATA Technologies, DSK Toyota, Cosmos Bank' },
  { name: 'Publicis Worldwide India', website: 'https://publicisindia.com', phone: '+91 22 493 8828', email: 'zen@publicisindia.com', services: 'Advertising, brand design, CRM, digital & production, experiential, mobile', clients: 'Cartier, BNP Paribas, Heineken, Nestle, Renault' },
  { name: 'Purnima Advertising', website: 'http://www.purnimaadvt.com', phone: '022 66603114', email: 'purnima@purnimaadvt.com', services: 'ATL/BTL, film screenings, brand launches', clients: 'Nirma, Vicco, Ambuja Cement, Gujarat Tourism' },
  { name: 'FCB Ulka', website: 'https://fcbulka.com', phone: '+91 22 202 6884', email: 'centrepoint@fcbulka.com', services: 'Integrated advertising & brand life cycle', clients: 'Amul, Tata Salt, Tata Motors, Whirlpool, Wipro' },
  { name: 'Ogilvy & Mather', website: 'https://www.ogilvy.com', phone: '022 4434 4074', email: 'pranav.pandit@ogilvy.com', services: 'Full-service global creative network', clients: 'Dove, Philips, Unilever, IBM' },
  { name: 'DDB Mudra Group', website: 'https://ddbmudragroup.com', phone: '+91 79 656 5659', email: 'r.arora@mudra.com', services: 'Integrated marketing communications network', clients: 'Aditya Birla Group, Bharat Petroleum, McDonald’s, Reebok, Puma' },
  { name: 'Madison Advertising Pvt Ltd', website: 'https://www.madisonindia.com', phone: '+91 22 266 3997', email: 'raj@madisonbmb.com', services: 'Diversified communication group services', clients: 'Asian Paints, Godrej, Kellogg’s, McDonald’s, Raymond' },
  { name: 'Triverse Advertising', website: 'https://triverseadvertising.com', phone: '9899770804', email: null, services: 'Brand architecture, design language, TVC, press, social', clients: 'Punjabi By Nature, Vardhman, DeVANS, Alstone' }
];

async function main() {
  for (const a of TOP22) {
    const slug = slugify(a.name);
    const data = {
      name: a.name,
      slug,
      location: null,
      city: null,
      state: null,
      website: a.website,
      instagram: null,
      services: a.services,
      description: a.clients,
      rating: 4.7,
      minBudget: 50000,
      verified: true,
      category: 'featured',
      expertiseTags: 'featured,top-list',
    };
    await prisma.agency.upsert({ where: { slug }, update: data, create: data });
    console.log('Upserted featured', a.name);
  }
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); });


