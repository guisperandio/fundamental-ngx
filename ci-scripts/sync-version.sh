#!/usr/bin/env bash

set -u -e

#
# Update Package version in the library package.json from root package.json
#

NEW_VERSION=$(node -p "require('./package.json').version")
echo "Updating packages.json under dist/libs with version ${NEW_VERSION}"

ANGULAR_VERSION=$(node -p "require('./package.json').dependencies['@angular/core']")
RXJS_VERSION=$(node -p "require('./package.json').dependencies['rxjs']")
CDK_VERSION=$(node -p "require('./package.json').dependencies['@angular/cdk']")
FDSTYLES_VERSION=$(node -p "require('./package.json').dependencies['fundamental-styles']")
FDNSTYLES_VERSION=$(node -p "require('./package.json').dependencies['@fundamental-styles/fn']")
FOCUSTRAP_VERSION=$(node -p "require('./package.json').dependencies['focus-trap']")
FOCUSVISIBLE_VERSION=$(node -p "require('./package.json').dependencies['focus-visible']")
THEMING_VERSION=$(node -p "require('./package.json').dependencies['@sap-theming/theming-base-content']")

cd ./dist

grep -rl 'VERSION_PLACEHOLDER' . | xargs  perl -X -p -i -e "s/VERSION_PLACEHOLDER/${NEW_VERSION}/g"
grep -rl 'ANGULAR_VER_PLACEHOLDER' . | xargs  perl -X -p -i -e "s/ANGULAR_VER_PLACEHOLDER/${ANGULAR_VERSION}/g"
grep -rl 'RXJS_VER_PLACEHOLDER' . | xargs  perl -X -p -i -e "s/RXJS_VER_PLACEHOLDER/${RXJS_VERSION}/g"
grep -rl 'CDK_VER_PLACEHOLDER' . | xargs  perl -X -p -i -e "s/CDK_VER_PLACEHOLDER/${CDK_VERSION}/g"
grep -rl 'FDSTYLES_VER_PLACEHOLDER' . | xargs  perl -X -p -i -e "s/FDSTYLES_VER_PLACEHOLDER/${FDSTYLES_VERSION}/g"
grep -rl 'FDNSTYLES_VER_PLACEHOLDER' . | xargs  perl -X -p -i -e "s/FDNSTYLES_VER_PLACEHOLDER/${FDNSTYLES_VERSION}/g"
grep -rl 'FOCUSTRAP_VER_PLACEHOLDER' . | xargs  perl -X -p -i -e "s/FOCUSTRAP_VER_PLACEHOLDER/${FOCUSTRAP_VERSION}/g"
grep -rl 'FOCUSVISIBLE_VER_PLACEHOLDER' . | xargs  perl -X -p -i -e "s/FOCUSVISIBLE_VER_PLACEHOLDER/${FOCUSVISIBLE_VERSION}/g"
grep -rl 'THEMING_VER_PLACEHOLDER' . | xargs  perl -X -p -i -e "s/THEMING_VER_PLACEHOLDER/${THEMING_VERSION}/g"

cd ../
