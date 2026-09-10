# Inventory comparison — live provider run

Baseline commit: 87d69f147f5d65de0bff43d8987dc9014e12e410. Dataset: e86fbf079002e3547a5774feba7466f83e9c3523959b3805c9a8a0a28e0480ea.

32 synthetic development/challenge examples, not a representative customer benchmark. Labels require owner review.
The baseline quantity view is an instrumented trace of one match per furniture category, not an inventory exposed by the original UI.

Baseline exact category+quantity maps: **11/32**. Heavy-review decisions correct: **27/32**.
Model validated: 32/32. Exact maps over ALL attempts: 31/32. Failures stay in the denominator.

| Case | Baseline exact | Baseline heavy review correct | Model |
| --- | --- | --- | --- |
| en-01 | yes | yes | exact |
| en-02 | no | yes | exact |
| en-03 | no | no | exact |
| en-04 | no | yes | exact |
| en-05 | no | yes | exact |
| en-06 | yes | yes | exact |
| fi-01 | yes | yes | exact |
| fi-02 | no | yes | exact |
| fi-03 | no | no | exact |
| fi-04 | no | yes | exact |
| fi-05 | no | yes | exact |
| fi-06 | yes | yes | exact |
| ru-01 | yes | yes | exact |
| ru-02 | no | yes | exact |
| ru-03 | no | no | exact |
| ru-04 | yes | yes | exact |
| ru-05 | no | yes | exact |
| ru-06 | yes | yes | exact |
| uk-01 | yes | yes | exact |
| uk-02 | no | yes | exact |
| uk-03 | no | no | exact |
| uk-04 | no | yes | exact |
| uk-05 | no | yes | exact |
| uk-06 | yes | yes | exact |
| en-07 | no | yes | exact |
| en-08 | no | no | exact |
| ru-07 | no | yes | exact |
| fi-07 | no | yes | exact |
| uk-07 | no | yes | different |
| en-09 | no | yes | exact |
| ru-08 | yes | yes | exact |
| fi-08 | yes | yes | exact |

Exact evidence matching validates quotations, not the semantic truth of quantity/category/status. No prices are generated or modified.
