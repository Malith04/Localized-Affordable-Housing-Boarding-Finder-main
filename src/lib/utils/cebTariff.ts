import { CEBApplianceItem, CEBTariffCalculation } from '@/types/bodima';

export const DEFAULT_STUDENT_APPLIANCES: CEBApplianceItem[] = [
  {
    id: 'laptop',
    name: 'Laptop / PC (Coding & Study)',
    sinhalaName: 'ලැප්ටොප් / පරිගණකය',
    iconName: 'Laptop',
    watts: 65,
    typicalDailyHours: 6,
    unitsPerMonth: 12,
    quantity: 1,
  },
  {
    id: 'fan',
    name: 'Ceiling / Stand Fan',
    sinhalaName: 'විදුලි පංකාව',
    iconName: 'Fan',
    watts: 75,
    typicalDailyHours: 10,
    unitsPerMonth: 22,
    quantity: 1,
  },
  {
    id: 'bulb',
    name: 'LED Room Light / Study Lamp',
    sinhalaName: 'කාමර LED බල්බය',
    iconName: 'Lightbulb',
    watts: 12,
    typicalDailyHours: 6,
    unitsPerMonth: 2,
    quantity: 1,
  },
  {
    id: 'kettle',
    name: 'Electric Kettle (Tea/Noodles)',
    sinhalaName: 'ඉලෙක්ට්‍රික් කේතලය',
    iconName: 'Coffee',
    watts: 1500,
    typicalDailyHours: 0.17, // ~10 mins
    unitsPerMonth: 8,
    quantity: 0,
  },
  {
    id: 'fridge',
    name: 'Mini Refrigerator (Shared)',
    sinhalaName: 'මිනි ශීතකරණය',
    iconName: 'Refrigerator',
    watts: 90,
    typicalDailyHours: 24,
    unitsPerMonth: 25,
    quantity: 0,
  },
  {
    id: 'iron',
    name: 'Clothes Iron',
    sinhalaName: 'ඉස්තිරික්කය',
    iconName: 'Shirt',
    watts: 1000,
    typicalDailyHours: 0.1,
    unitsPerMonth: 2,
    quantity: 0,
  },
  {
    id: 'cooker',
    name: 'Rice Cooker / Electric Hotplate',
    sinhalaName: 'රයිස් කුකර් / හොට්ප්ලේට්',
    iconName: 'Utensils',
    watts: 700,
    typicalDailyHours: 0.5,
    unitsPerMonth: 11,
    quantity: 0,
  },
  {
    id: 'heater',
    name: 'Immersion Water Heater',
    sinhalaName: 'වතුර හීටරය',
    iconName: 'Flame',
    watts: 1200,
    typicalDailyHours: 0.25,
    unitsPerMonth: 9,
    quantity: 0,
  },
];

/**
 * Calculates authentic Sri Lanka CEB (Ceylon Electricity Board) Domestic Tariffs.
 * Tier breakdown reflects progressive block billing and fixed customer charges.
 */
export function calculateCEBBill(units: number): CEBTariffCalculation {
  const roundedUnits = Math.max(0, Math.round(units));
  let unitCostTotal = 0;
  let fixedCharge = 0;
  let tierName = '';
  let tierSinhala = '';

  if (roundedUnits <= 30) {
    unitCostTotal = roundedUnits * 8.0;
    fixedCharge = 180.0;
    tierName = 'Subsidized Tier 1 (0 - 30 Units)';
    tierSinhala = 'අඩු පරිභෝජන කාණ්ඩය (ඒකක 0 - 30)';
  } else if (roundedUnits <= 60) {
    // 30 units at Rs. 8 + remainder at Rs. 20
    unitCostTotal = 30 * 8.0 + (roundedUnits - 30) * 20.0;
    fixedCharge = 360.0;
    tierName = 'Subsidized Tier 2 (31 - 60 Units)';
    tierSinhala = 'මධ්‍යම පිරිමැසුම් කාණ්ඩය (ඒකක 31 - 60)';
  } else if (roundedUnits <= 90) {
    // Standard domestic block: first 60 units at Rs. 25 + remainder at Rs. 30
    unitCostTotal = 60 * 25.0 + (roundedUnits - 60) * 30.0;
    fixedCharge = 480.0;
    tierName = 'General Domestic Tier (61 - 90 Units)';
    tierSinhala = 'සාමාන්‍ය ගෘහස්ථ කාණ්ඩය (ඒකක 61 - 90)';
  } else if (roundedUnits <= 120) {
    unitCostTotal = 60 * 25.0 + 30 * 30.0 + (roundedUnits - 90) * 50.0;
    fixedCharge = 1180.0;
    tierName = 'Upper Domestic Tier (91 - 120 Units)';
    tierSinhala = 'ඉහළ පරිභෝජන කාණ්ඩය (ඒකක 91 - 120)';
  } else if (roundedUnits <= 180) {
    unitCostTotal = 60 * 25.0 + 30 * 30.0 + 30 * 50.0 + (roundedUnits - 120) * 50.0;
    fixedCharge = 1720.0;
    tierName = 'Heavy Usage Tier (121 - 180 Units)';
    tierSinhala = 'අධික පරිභෝජන කාණ්ඩය (ඒකක 121 - 180)';
  } else {
    unitCostTotal = 60 * 25.0 + 30 * 30.0 + 30 * 50.0 + 60 * 50.0 + (roundedUnits - 180) * 75.0;
    fixedCharge = 2150.0;
    tierName = 'Luxury Usage Tier (> 180 Units)';
    tierSinhala = 'උපරිම පරිභෝජන කාණ්ඩය (> 180)';
  }

  const totalMonthlyBill = Math.round(unitCostTotal + fixedCharge);
  const effectiveRatePerUnit = roundedUnits > 0 ? Number((totalMonthlyBill / roundedUnits).toFixed(1)) : 0;

  const savingsTips: string[] = [];
  if (roundedUnits > 60) {
    savingsTips.push('Keeping your total consumption below 60 units drops you into the subsidized CEB block, saving over 40% on fixed charges.');
  }
  if (roundedUnits > 90) {
    savingsTips.push('Switching stand fans to timer mode and boiling only required water in kettles can bring you under 90 units.');
  }
  savingsTips.push('Under Sri Lankan law, landlords cannot add arbitrary surcharges on sub-meters beyond actual CEB unit consumption.');

  return {
    totalUnits: roundedUnits,
    unitCostTotal: Math.round(unitCostTotal),
    fixedCharge,
    totalMonthlyBill,
    effectiveRatePerUnit,
    tierName,
    tierSinhala,
    savingsTips,
  };
}
