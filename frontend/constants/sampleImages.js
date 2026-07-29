/**
 * Frontend sample images — clearly Indian people & India fashion
 * Backend untouched
 */

// Indian creators / professionals (portraits & traditional looks)
export const INDIAN_PEOPLE = {
  // Women
  woman1:
    'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=600&h=600&q=80',
  woman2:
    'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=600&h=600&q=80',
  woman3:
    'https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?auto=format&fit=crop&w=600&h=600&q=80',
  woman4:
    'https://images.unsplash.com/photo-1595956553066-fe24a8c33395?auto=format&fit=crop&w=600&h=600&q=80',
  woman5:
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=600&h=600&q=80',
  // Men
  man1:
    'https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&w=600&h=600&q=80',
  man2:
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&h=600&q=80',
  man3:
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&h=600&q=80',
  man4:
    'https://images.unsplash.com/photo-1566753323558-f4e0952af115?auto=format&fit=crop&w=600&h=600&q=80',
};

// Tall cards / tips / reels covers — Indian creators
export const INDIAN_LIFESTYLE = {
  creatorWork1:
    'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=500&h=700&q=80',
  creatorWork2:
    'https://images.unsplash.com/photo-1615109398623-88346a601842?auto=format&fit=crop&w=500&h=700&q=80',
  creatorWork3:
    'https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?auto=format&fit=crop&w=500&h=700&q=80',
  creatorWork4:
    'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=500&h=700&q=80',
  creatorWork5:
    'https://images.unsplash.com/photo-1595956553066-fe24a8c33395?auto=format&fit=crop&w=500&h=700&q=80',
  creatorWork6:
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=500&h=700&q=80',
};

// Indian ethnic fashion / campaign product shots
export const INDIAN_FASHION = {
  saree:
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
  lehenga:
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80',
  kurta:
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80',
  jewelry:
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
  dupatta:
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
  wedding:
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
  market:
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80',
  festival:
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=80',
};

export const peopleList = [
  INDIAN_PEOPLE.woman1,
  INDIAN_PEOPLE.man1,
  INDIAN_PEOPLE.woman2,
  INDIAN_PEOPLE.man2,
  INDIAN_PEOPLE.woman3,
  INDIAN_PEOPLE.man3,
  INDIAN_PEOPLE.woman4,
  INDIAN_PEOPLE.woman5,
];

/** Default fallback when product image missing */
export const FALLBACK_INDIAN = INDIAN_FASHION.saree;
export const FALLBACK_PERSON = INDIAN_PEOPLE.woman1;

export default {
  INDIAN_PEOPLE,
  INDIAN_LIFESTYLE,
  INDIAN_FASHION,
  peopleList,
  FALLBACK_INDIAN,
  FALLBACK_PERSON,
};
