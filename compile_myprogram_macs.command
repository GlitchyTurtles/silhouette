#!/bin/sh
# Copyright 2020 Carson Cheng
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

APPDIR=$(dirname "$0")
cd "$APPDIR"

/bin/sh ./compile_myprogram_bash.sh

if [ $SHLVL -lt 3 ]; then
  $SHELL
fi
exit
