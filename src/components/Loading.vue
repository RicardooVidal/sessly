<template>
    <div class="loading-container">
    <div class="loading">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><radialGradient id="a18" cx=".66" fx=".66" cy=".3125" fy=".3125" gradientTransform="scale(1.5)"><stop offset="0" stop-color="var(--primary)"></stop><stop offset=".3" stop-color="var(--primary)" stop-opacity=".9"></stop><stop offset=".6" stop-color="var(--primary)" stop-opacity=".6"></stop><stop offset=".8" stop-color="var(--primary)" stop-opacity=".3"></stop><stop offset="1" stop-color="var(--primary)" stop-opacity="0"></stop></radialGradient><circle transform-origin="center" fill="none" stroke="url(#a18)" stroke-width="6" stroke-linecap="round" stroke-dasharray="200 1000" stroke-dashoffset="0" cx="100" cy="100" r="70"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="0.4s" values="0;360" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></circle><circle transform-origin="center" fill="none" opacity=".2" stroke="var(--primary)" stroke-width="6" stroke-linecap="round" cx="100" cy="100" r="70"></circle></svg>
    </div>
</div>
</template>

<script setup>

</script>

<style scoped>

.loading-container {
    position: relative;
}

.loading svg {
  width: 48px;
  height: 48px;
}

.loading {
    position: absolute;
    top: 0;
    left: 50%;
}
</style>