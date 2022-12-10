#!/bin/sh
# Copyright 2020 Carson Cheng
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

APPDIR=$(dirname "$0")
cd "$APPDIR"

if [ -f "./deno" ]; then
  echo "Using deno in: " "`pwd`" 1>&2
  deno_app=./deno
elif [ -f "$HOME/.deno/bin/deno.exe" ]; then
  echo "Using deno.exe in: " "$HOME/.deno/bin/" 1>&2
  deno_app="$HOME/.deno/bin/deno.exe"
elif [ -f "$HOME/.deno/bin/deno" ]; then
  echo "Using deno in: " "$HOME/.deno/bin/" 1>&2
  deno_app="$HOME/.deno/bin/deno"
elif [ -f "$HOME/.local/bin/deno" ]; then
  echo "Using deno in: " "$HOME/.local/bin/" 1>&2
  deno_app="$HOME/.local/bin/deno"
else
  echo "Using deno in \$PATH" 1>&2
  deno_app=deno
fi
echo "" 1>&2

"$deno_app" run          -A --unstable --allow-read --allow-net --allow-write="./" libs/compile_myprogram.ts --build "build" --emitByFilenameOnly "./myprogram.ts"

if [ $SHLVL -lt 2 ]; then
  $SHELL
fi
exit



