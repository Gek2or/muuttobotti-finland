# Inventory comparison — live provider run

Baseline commit: 87d69f147f5d65de0bff43d8987dc9014e12e410. Dataset: e86fbf079002e3547a5774feba7466f83e9c3523959b3805c9a8a0a28e0480ea.

32 synthetic development/challenge examples, not a representative customer benchmark. Labels require owner review.
The baseline quantity view is an instrumented trace of one match per furniture category, not an inventory exposed by the original UI.

Baseline exact category+quantity maps: **11/32**. Heavy-review decisions correct: **27/32**.
Model validated: 0/32. Exact maps over ALL attempts: 0/32. Failures stay in the denominator.

| Case | Baseline exact | Baseline heavy review correct | Model |
| --- | --- | --- | --- |
| en-01 | yes | yes | rate_limited |
| en-02 | no | yes | rate_limited |
| en-03 | no | no | rate_limited |
| en-04 | no | yes | rate_limited |
| en-05 | no | yes | rate_limited |
| en-06 | yes | yes | rate_limited |
| fi-01 | yes | yes | rate_limited |
| fi-02 | no | yes | rate_limited |
| fi-03 | no | no | rate_limited |
| fi-04 | no | yes | rate_limited |
| fi-05 | no | yes | rate_limited |
| fi-06 | yes | yes | rate_limited |
| ru-01 | yes | yes | rate_limited |
| ru-02 | no | yes | rate_limited |
| ru-03 | no | no | rate_limited |
| ru-04 | yes | yes | rate_limited |
| ru-05 | no | yes | rate_limited |
| ru-06 | yes | yes | rate_limited |
| uk-01 | yes | yes | rate_limited |
| uk-02 | no | yes | rate_limited |
| uk-03 | no | no | rate_limited |
| uk-04 | no | yes | rate_limited |
| uk-05 | no | yes | rate_limited |
| uk-06 | yes | yes | rate_limited |
| en-07 | no | yes | rate_limited |
| en-08 | no | no | rate_limited |
| ru-07 | no | yes | rate_limited |
| fi-07 | no | yes | rate_limited |
| uk-07 | no | yes | rate_limited |
| en-09 | no | yes | rate_limited |
| ru-08 | yes | yes | rate_limited |
| fi-08 | yes | yes | rate_limited |

Exact evidence matching validates quotations, not the semantic truth of quantity/category/status. No prices are generated or modified.
