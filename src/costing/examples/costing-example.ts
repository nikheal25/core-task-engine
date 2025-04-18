/**
 * Example payload for ATR asset costing
 */
export const atrCostingExample = {
  assetType: 'ATR',
  commonFields: {
    deploymentType: 'cloud',
    region: 'us-east-1',
    supportLevel: 'standard',
  },
  assetComponents: [
    {
      name: 'Main Component',
      resourceModel: [
        {
          location: 'US',
          allocation: 60,
        },
        {
          location: 'EU',
          allocation: 40,
        },
      ],
    },
  ],
  specificFields: {
    complexity: 'medium',
    licenseCount: 25,
    hasCustomComponents: true,
  },
};

/**
 * Example payload for Q++ asset costing
 */
export const qPlusPlusCostingExample = {
  assetType: 'Q++',
  commonFields: {
    deploymentType: 'hybrid',
    region: 'eu-west-1',
    supportLevel: 'premium',
  },
  assetComponents: [
    {
      name: 'Main Component',
      resourceModel: [
        {
          location: 'EU',
          allocation: 50,
        },
        {
          location: 'UK',
          allocation: 30,
        },
        {
          location: 'APAC',
          allocation: 20,
        },
      ],
    },
  ],
  specificFields: {
    userCount: 500,
    modules: ['reporting', 'analytics', 'workflow', 'dashboard'],
    dataIntegrations: 3,
    storageRequirement: 'large',
  },
};

/**
 * Example response format (for ATR asset)
 */
export const exampleCostingResponse = {
  assetType: 'ATR',
  buildCost: {
    total: 41000,
    currency: 'USD',
    breakdown: {
      baseBuild: {
        amount: 10000,
        description: 'Base build cost for medium complexity',
      },
      effortBased: {
        amount: 27000,
        description:
          'Effort-based build cost for locations: US (60%), EU (40%)',
      },
      deployment: {
        amount: 2000,
        description: 'Deployment setup cost',
      },
      licensing: {
        amount: 12500,
        description: 'License setup for 25 licenses',
      },
      customization: {
        amount: 8000,
        description: 'Custom components development',
      },
    },
  },
  runCost: {
    total: 4240,
    currency: 'USD',
    period: 'monthly',
    breakdown: {
      license: {
        amount: 2500,
        description: 'Monthly license fee for 25 licenses',
      },
      support: {
        amount: 1200,
        description: 'Support cost with standard level',
      },
      operational: {
        amount: 640,
        description: 'Operational cost based on locations: US, EU',
      },
      maintenance: {
        amount: 1000,
        description: 'Maintenance cost for medium complexity',
      },
    },
  },
  estimationDate: new Date(),
};
