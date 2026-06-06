---
name: shap-model-explainability
title: SHAP Model Explainability
description: Use when explaining ML model predictions, computing feature importance, generating SHAP plots, debugging models, or analyzing bias/fairness with Shapley values; triggers: SHAP, feature importance, model explainability, "why did my model predict this", Shapley, model bias, feature
domain: 智能/model-ops
triggers: [SHAP, feature importance, model explainability, why did my model make this prediction, Shapley values, model bias analysis, feature contribution, explainable AI, waterfall plot, beeswarm plot]
tags: [ai, misc, shap, explainability, feature-importance, model-debugging, fairness, xai]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [scikit-learn-ml, mlops-model-productionizer, statsmodels-statistical-modeling, computer-vision-expert]
combines_with: [matplotlib-visualization, huggingface-model-trainer]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
Adapted from K-Dense-AI/scientific-agent-skills (MIT). SHAP (SHapley Additive exPlanations) is a unified approach to explain machine learning model outputs using Shapley values from cooperative game theory. It covers selecting an explainer, computing SHAP values, visualizing them, and diagnosing bias/leakage. It explains *how the model thinks* — it does not handle training, hyperparameter tuning, or causal inference (SHAP reveals association, not causation).

SHAP works with all model types: tree-based models (XGBoost, LightGBM, CatBoost, Random Forest), deep learning models (TensorFlow, PyTorch, Keras), linear models, and black-box models.

## When to use

Trigger this skill when users ask about:

- "Explain which features are most important in my model"
- "Generate SHAP plots" (waterfall, beeswarm, bar, scatter, force, heatmap, etc.)
- "Why did my model make this prediction?"
- "Calculate SHAP values for my model"
- "Visualize feature importance using SHAP"
- "Debug my model's behavior" or "validate my model"
- "Check my model for bias" or "analyze fairness"
- "Compare feature importance across models"
- "Implement explainable AI" or "add explanations to my model"
- "Understand feature interactions"
- "Create a model interpretation dashboard"

Do **not** use for: model training, hyperparameter tuning, or pure accuracy/AUC evaluation (those are modeling itself); or causal inference — SHAP reveals only association and model behavior, and causal claims require domain knowledge.

## Steps

### Step 1: Select the right explainer (decision tree)

1. **Tree-based model?** (XGBoost, LightGBM, CatBoost, Random Forest, Gradient Boosting) → `shap.TreeExplainer` (fast, exact).
2. **Deep neural network?** (TensorFlow, PyTorch, Keras, CNNs, RNNs, Transformers) → `shap.DeepExplainer` or `shap.GradientExplainer`.
3. **Linear model?** (Linear/Logistic Regression, GLMs) → `shap.LinearExplainer` (extremely fast).
4. **Any other model?** (SVMs, custom functions, black-box models) → `shap.KernelExplainer` (model-agnostic but slower).
5. **Unsure?** → `shap.Explainer` (automatically selects the best algorithm).

Speed, fastest to slowest: `LinearExplainer` > `TreeExplainer` > `DeepExplainer` ≈ `GradientExplainer` > `KernelExplainer` > `PermutationExplainer` (exact but very slow).

### Step 2: Compute SHAP values

```python
import shap
import xgboost as xgb

# Train model
model = xgb.XGBClassifier().fit(X_train, y_train)

# Create explainer
explainer = shap.TreeExplainer(model)

# Compute SHAP values
shap_values = explainer(X_test)

# The shap_values object contains:
# - values: SHAP values (feature attributions)
# - base_values: Expected model output (baseline)
# - data: Original feature values
```

Black-box / deep models need background data (a baseline): a random sample of 50–1000 rows from the training set, or kmeans-selected representative samples. For DeepExplainer/KernelExplainer, 100–1000 samples balances accuracy and speed. The baseline affects SHAP value magnitudes but not relative importance.

### Step 3: Visualize from global to local

**Global understanding** (entire dataset):

```python
# Beeswarm - feature importance with value distributions
shap.plots.beeswarm(shap_values, max_display=15)

# Bar - clean summary of feature importance
shap.plots.bar(shap_values)
```

**Individual predictions** (local):

```python
# Waterfall - detailed breakdown of single prediction
shap.plots.waterfall(shap_values[0])

# Force - additive force visualization
shap.plots.force(shap_values[0])
```

**Feature relationships**:

```python
# Scatter - feature-prediction relationship
shap.plots.scatter(shap_values[:, "Feature_Name"])

# Colored by another feature to reveal interactions
shap.plots.scatter(shap_values[:, "Age"], color=shap_values[:, "Education"])
```

### Core workflows

- **Basic explanation**: create explainer → compute SHAP values → global plots (beeswarm/bar) → top feature scatter plots → individual waterfall plots.
- **Model debugging**: identify prediction errors → explain misclassified samples → check for unexpected feature importance (data leakage) → validate relationships make sense.
- **Feature engineering**: identify nonlinear relationships (transform candidates) and interactions (interaction-term candidates) → engineer features → retrain and re-compare SHAP values.
- **Model comparison**: compute SHAP per model → compare global importance → check ranking consistency → select on accuracy + interpretability + consistency.
- **Fairness/bias**: identify protected attributes → compare importance across groups → check protected-attribute SHAP importance → identify proxy features → mitigate.
- **Production**: train and save model → create and save explainer → build explanation service with API endpoints → cache and monitor.

## Example

### Complete model analysis (global first, then local)

```python
import shap, numpy as np

# 1. Setup
explainer = shap.TreeExplainer(model)
shap_values = explainer(X_test)

# 2. Global importance
shap.plots.beeswarm(shap_values)
shap.plots.bar(shap_values)

# 3. Top feature relationships (5 highest mean(|SHAP|))
top_features = X_test.columns[np.abs(shap_values.values).mean(0).argsort()[-5:]]
for feature in top_features:
    shap.plots.scatter(shap_values[:, feature])

# 4. Example predictions
shap.plots.waterfall(shap_values[0])
```

### Model debugging / data leakage check

```python
# Find errors
errors = model.predict(X_test) != y_test
for idx in np.where(errors)[0][:5]:
    shap.plots.waterfall(shap_values[idx])   # which features drove the misclassification

# A feature with unexpectedly high importance → suspect leakage; re-check that column for label info
shap.plots.scatter(shap_values[:, "Suspicious_Feature"])
```

### Cohort / fairness comparison

```python
cohort1_mask = X_test["Group"] == "A"
cohort2_mask = X_test["Group"] == "B"
shap.plots.bar({"Group A": shap_values[cohort1_mask],
                "Group B": shap_values[cohort2_mask]})
# Watch the SHAP importance of protected attributes and highly correlated proxy features
```

### Large data / production optimization

```python
shap_values = explainer(X_test[:1000])              # sample a subset
shap.plots.beeswarm(shap_values[:1000])
shap.plots.scatter(shap_values[:, "Feature"], alpha=0.3)  # transparency for dense plots

import joblib
joblib.dump(explainer, "explainer.pkl")             # cache the explainer
```

### Production explanation service

```python
class ExplanationService:
    def __init__(self, model_path, explainer_path):
        self.model = joblib.load(model_path)
        self.explainer = joblib.load(explainer_path)

    def predict_with_explanation(self, X):
        prediction = self.model.predict(X)
        shap_values = self.explainer(X)
        return {
            "prediction": prediction[0],
            "base_value": shap_values.base_values[0],
            "feature_contributions": dict(zip(X.columns, shap_values.values[0])),
        }
```

**Worked scenario**: explaining a declined sample from an XGBoost risk model.
1. `explainer = shap.TreeExplainer(model)` — note classifiers explain margin (log-odds) by default; to explain probability pass `model_output="probability"`.
2. `sv = explainer(X_test)`; `shap.plots.waterfall(sv[i])` shows the path from baseline 0.30 through each feature's additive contribution to the final 0.50 (additivity: baseline + ΣSHAP = prediction).
3. `shap.plots.beeswarm(sv)` confirms the global drivers; run `scatter` on top features to verify the direction of each relationship matches business sense.

## Notes

- **Additivity**: SHAP values sum to the difference between the prediction and the baseline. Positive pushes the prediction higher, negative lower; magnitude is the strength of impact.
- **Units trap**: tree classifiers output log-odds by default, not probability — do not read log-odds as probability. Know whether the model output is raw / probability / log-odds.
- **Wrong explainer**: using KernelExplainer on tree models is slow and unnecessary — use it only when no specialized explainer exists.
- **Insufficient background data** makes Deep/Kernel results unstable; use 100–1000 representative samples.
- **Cluttered plots**: adjust `max_display` or use feature clustering. If plots don't display, check the matplotlib backend and call `plt.show()` if needed.
- **Correlated features** split attribution; use TreeExplainer's correlation-aware options or feature clustering to handle redundancy.
- **Association, not causation**: SHAP reveals association and model behavior; suspect data leakage for abnormally high importance; validate conclusions with domain knowledge.
- **Install**: `uv pip install -U shap matplotlib` (depends on numpy/pandas/scikit-learn/scipy; add xgboost/lightgbm/tensorflow/torch per model type).

## See also

- **related**: `scikit-learn-ml` — trains the model to be explained; `computer-vision-expert`, `huggingface-model-trainer` — the deep/vision models you explain; `statsmodels-statistical-modeling` — an alternative lens on model quality.
- **combines_with**: `mlops-model-productionizer` — wire explanations into a production API and ship them alongside drift monitoring; `matplotlib-visualization` — render and customize the SHAP figures.
- **Source reference docs** (upstream `references/`): `explainers.md` (each explainer's parameters and fit), `plots.md` (all plot types and a selection guide), `workflows.md` (debugging / feature engineering / comparison / fairness / deployment / time series), `theory.md` (Shapley-value math and computation algorithms — Tree SHAP, Kernel SHAP).
