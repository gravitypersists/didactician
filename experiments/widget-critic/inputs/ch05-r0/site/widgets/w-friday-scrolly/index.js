/* w-friday-scrolly · Ch 05 §03 "Friday, 17:45": one scrollytelling lane (F1–F5) over Fennel's cluster
   drawing, its record and the loops that work on it, gated on k-03 in F2's step column.
   Glue only. The drawing (renderCluster) and the lane controller live in the course pool:
   pool/cluster/cluster.js and pool/cluster/lanes.js (format and options: explainers/_pool/README.md,
   "Cluster drawing" and "Cluster lanes"). This lane's steps, snapshots and strings are in ./data.js
   (window.ClusterData); the mount contract is in index.html §03, above the mount. */
(function () {
  'use strict';
  if (!window.ClusterCanvas || !window.ClusterCanvas.lanes) { console.error('w-friday-scrolly: pool/cluster/lanes.js missing'); return; }
  window.ClusterCanvas.lanes('w-friday-scrolly', window.ClusterData);
})();
