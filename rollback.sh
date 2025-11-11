#!/bin/sh
set -e

echo "Documotion rollback helper"
echo "This script provides examples; adapt to your environment."

if [ -f prisma/snapshots/*.bak ]; then
  LATEST=$(ls -t prisma/snapshots/*.bak | head -n1)
  echo "Restoring DB from $LATEST"
  cp "$LATEST" prisma/dev.db
  echo "DB restored to prisma/dev.db"
else
  echo "No DB snapshot found under prisma/snapshots/"
fi

echo "Docker example: docker service update --image <previous-image> <service>"
echo "K8s example: kubectl rollout undo deployment/<name>"

echo "Done."


