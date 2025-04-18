# Cost Estimator Microservice Documentation

## Overview

This NestJS-TypeScript microservice calculates the build cost for assets based on complexity, resource allocation, and location-specific blend rates. It uses MongoDB for data storage with a normalized schema.

## Database Schema (MongoDB)

### BlendRates Collection

Stores system-wide blend rates for each location.

```json
{
  "_id": ObjectId,
  "location": String, // e.g., "India", "Australia"
  "rates": {
    "xSmall": Number,
    "Small": Number,
    "Medium": Number,
    "Large": Number,
    "xLarge": Number
  }
}
```

### Assets Collection

Stores asset details and their cost components.

```json
{
  "_id": ObjectId,
  "name": String, // e.g., "Asset1", "ATR"
  "components": [
    {
      "name": String, // e.g., "ABC"
      "efforts": {
        "xSmall": { "India": Number, "Australia": Number },
        "Small": { "India": Number, "Australia": Number },
        "Medium": { "India": Number, "Australia": Number },
        "Large": { "India": Number, "Australia": Number },
        "xLarge": { "India": Number, "Australia": Number }
      }
    }
  ]
}
```

## Costing Logic

The microservice calculates the **build cost** for an asset based on its components, complexity, and resource allocation across locations. Here’s how it works:

1. **Input**:

   - **Asset name** (e.g., "Asset1").
   - **Complexity** (xSmall, Small, Medium, Large, or xLarge).
   - **Resource model**: A list showing how work is split between locations, e.g., `[{"location": "India", "allocation": 10}, {"location": "Australia", "allocation": 90}]` (allocations sum to 100%).

2. **Blend Rates**: Each location (e.g., India, Australia) has a fixed cost per hour (blend rate) for each complexity level. These rates are the same for all assets. See reference table below.

3. **Effort Hours**: Each asset has multiple cost components (e.g., "ABC"). Each component has predefined effort hours for each complexity and location. See reference table below.

4. **Calculation**:

   - For each component:
     - For each location in the resource model:
       - Get the blend rate for the given complexity and location.
       - Get the effort hours for the component, complexity, and location.
       - Calculate: `(allocation / 100) * blend rate * effort hours`.
     - Add up the costs for all locations to get the component’s cost.
   - Add up all component costs to get the total build cost.


** IMPORTANT NOTE: this is just one type of costing logic. there will be other types of costing, but they will be added by devs. e.g. those new costing logic will not have this blend rate related logic, but some other logic.


## Reference Tables

### Blend Rates (System-Wide)

| Location | xSmall | Small | Medium | Large | xLarge |
| --- | --- | --- | --- | --- | --- |
| Australia | $63 | $63 | $65 | $68 | $72 |
| India | $14 | $14 | $15 | $16 | $17 |

### Effort Hours (Component ABC, Asset1)

| Complexity | India | Australia |
| --- | --- | --- |
| xSmall | 21.14 | 19.86 |
| Small | 23.10 | 21.91 |
| Medium | 32.80 | 31.92 |
| Large | 42.60 | 41.67 |
| xLarge | 52.47 | 51.25 |

## Example Calculation for Asset

- **Input**: Asset: "Asset1", Complexity: "Medium", Resource Model: India (10%), Australia (90%).
- **Component ABC**:
  - **India**: 10% \* $15 \* 32.8 = $49.20.
  - **Australia**: 90% \* $65 \* 31.92 = $1,867.32.
  - **Component cost**: $49.20 + $1,867.32 = $1,916.52.
- Repeat for other components and sum for total build cost.

## Notes

- Blend rates are system-wide and stored separately to avoid redundancy.
- Ensure `resourceModel` allocations sum to 100%.
- Validate inputs for asset existence, valid locations, and complexity.