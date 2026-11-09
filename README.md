# Praktikal Explainer Kit

Hand-drawn, step-through explainers (Lab Notebook style) for Praktikal `htmlArtifact` nodes. Version 0.2.0. Needs rough.js 4.6.6.

```html
<script src="https://cdn.jsdelivr.net/npm/roughjs@4.6.6/bundled/rough.js"></script>
<script src="https://cdn.jsdelivr.net/gh/OWNER/praktikal-explainer-kit@v0.2.0/explainer-kit.min.js"></script>
<script>
Explainer.create({ title: '...', alt: '...' }, k => {
  k.beat('Caption.', () => { k.circle(960, 540, 300, { fill: k.C.yellow }); });
});
</script>
```

Always load a tagged version (`@v0.2.0`), never a branch: explainers already in lessons must not change when the kit does.

API and authoring rules live in the Praktikal skill `hand-drawn-explainer`. `examples/` holds two scene scripts.
