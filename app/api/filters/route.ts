import { NextResponse } from 'next/server';

// This would typically come from your database
const filtersData = [
  {
    id: 'Branch',
    name: 'Branch',
    type: 'checkbox',
    options: [
      { value: 'imus', label: 'Imus', checked: false },
      { value: 'bacoor', label: 'Bacoor', checked: false },
      { value: 'camalig', label: 'Camalig', checked: false },
    ],
  },
  {
    id: 'PriceRange',
    name: 'Price Range',
    type: 'price-range',
    options: [], // No options needed for price range
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: filtersData
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}