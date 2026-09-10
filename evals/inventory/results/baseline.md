# Inventory comparison — baseline only

Baseline commit: 87d69f147f5d65de0bff43d8987dc9014e12e410. Dataset: e86fbf079002e3547a5774feba7466f83e9c3523959b3805c9a8a0a28e0480ea.

32 synthetic development/challenge examples, not a representative customer benchmark. Labels require owner review.
The baseline quantity view is an instrumented trace of one match per furniture category, not an inventory exposed by the original UI.

Baseline exact category+quantity maps: **11/32**. Heavy-review decisions correct: **27/32**.
**Model not run. No claim of improvement, accuracy, latency or cost can be made.**

| Case | Baseline exact | Baseline heavy review correct | Model |
| --- | --- | --- | --- |
| en-01 | yes | yes | not run |
| en-02 | no | yes | not run |
| en-03 | no | no | not run |
| en-04 | no | yes | not run |
| en-05 | no | yes | not run |
| en-06 | yes | yes | not run |
| fi-01 | yes | yes | not run |
| fi-02 | no | yes | not run |
| fi-03 | no | no | not run |
| fi-04 | no | yes | not run |
| fi-05 | no | yes | not run |
| fi-06 | yes | yes | not run |
| ru-01 | yes | yes | not run |
| ru-02 | no | yes | not run |
| ru-03 | no | no | not run |
| ru-04 | yes | yes | not run |
| ru-05 | no | yes | not run |
| ru-06 | yes | yes | not run |
| uk-01 | yes | yes | not run |
| uk-02 | no | yes | not run |
| uk-03 | no | no | not run |
| uk-04 | no | yes | not run |
| uk-05 | no | yes | not run |
| uk-06 | yes | yes | not run |
| en-07 | no | yes | not run |
| en-08 | no | no | not run |
| ru-07 | no | yes | not run |
| fi-07 | no | yes | not run |
| uk-07 | no | yes | not run |
| en-09 | no | yes | not run |
| ru-08 | yes | yes | not run |
| fi-08 | yes | yes | not run |

Exact evidence matching validates quotations, not the semantic truth of quantity/category/status. No prices are generated or modified.
