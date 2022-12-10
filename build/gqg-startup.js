"use strict";
/*
 * Copyright 2012, 2016, 2017, 2019, 2020 Carson Cheng
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/*
 * GQGuardrail-GQ-startup loads GQGuardrail and gameQuery.
 * This script auto-loads myprogram.js.
 * Purpose is to hides stuff to make myprogram.js easier to learn.
 */
//import { PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT, sprite } from "./gqg-mod.ts";
var gqguardrailStartupLoaded;
if (!gqguardrailStartupLoaded) {
    gqguardrailStartupLoaded = true;
    console.log("gqguardrail startup loading...");
    $(() => {
        var localLibsOnly = true; // set false to use CDN libs if available, esp. if hot patching desired
        // Avoid console.log errors in browsers that lack a console (i.e. IE)
        // see: http://stackoverflow.com/questions/7742781/why-javascript-only-works-after-opening-developer-tools-in-ie-once
        // for more complete solution, see: https://github.com/h5bp/html5-boilerplate/blob/master/src/js/plugins.js
        if (!window.console) {
            console = { log: () => { } };
        }
        var urlExist = (url, callback) => {
            if (localLibsOnly) {
                callback(false);
                return;
            }
            // see: https://stackoverflow.com/questions/3646914/how-do-i-check-if-file-exists-in-jquery-or-javascript
            var http = new XMLHttpRequest();
            http.open('HEAD', url, true);
            http.onload = (e) => {
                if (http.readyState === 4) {
                    callback(http.status !== 404);
                }
            };
            http.onerror = (e) => {
                callback(false);
            };
            http.send(null);
        };
        var loadCss = (url, callback) => {
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.rel = "stylesheet";
            link.type = 'text/css';
            link.media = 'all';
            link.href = url;
            link.onreadystatechange = callback;
            link.onload = callback;
            head.appendChild(link);
            //console.log("Loaded css: " + url);
        };
        var loadScript = (url, callback) => {
            // see: https://stackoverflow.com/questions/950087/include-a-javascript-file-in-another-javascript-file
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            //script.type="module";//CORS violation when run locally
            script.onreadystatechange = callback;
            script.onload = callback;
            head.appendChild(script);
            //console.log("Loaded script: " + url);
        };
        var loadRsrc = (loader, scriptName, cdnUrl, fallbackUrl, callback) => {
            // loader must be like loadScript(url, callback), or loadCss(url, callback)
            callback = callback || (() => { });
            urlExist(cdnUrl, (theUrlExists) => {
                if (theUrlExists) {
                    loader(cdnUrl, () => {
                        console.log('Using online CDN: ' + scriptName);
                        callback();
                    });
                }
                else {
                    loader(fallbackUrl, () => {
                        console.log('Using fallback lib: ' + scriptName);
                        callback();
                    });
                }
            });
        };
        // ***************************************************************************************
        // main
        // ***************************************************************************************
        // GitCDN will take up to 2 hours to propagate file changes
        const gitRepoUrl = "https://gitcdn.xyz/cdn/ccheng/JQGQ-Project-Template/";
        const gitTag = "v5.8"; // use gitcdn.xyz/cdn instead of /repo to get specific hash instead of latest commit
        const cdnUrlBase = gitRepoUrl + gitTag;
        const gqgLibPath = "build/gqg-mod.js"; // relative to GQG Web App project root
        const moduleHackLibPath = "build/gqg-module-Fn.js";
        const studentProgramPath = "build/myprogram.js";
        loadRsrc(loadScript, gqgLibPath, cdnUrlBase + gqgLibPath, gqgLibPath, () => {
            //consolePrint("Using: " + gqglibname);
            sprite("playground").playground({
                height: GQG_PLAYGROUND_HEIGHT,
                width: GQG_PLAYGROUND_WIDTH,
                keyTracker: true,
                mouseTracker: true
            });
            loadRsrc(loadScript, moduleHackLibPath, cdnUrlBase + moduleHackLibPath, moduleHackLibPath, () => {
                loadScript(studentProgramPath, () => {
                    console.log("Running: " + studentProgramPath);
                    console.log("Warning: Make sure you compiled your code before testing!");
                    setup();
                    var REFRESH_RATE = 41;
                    $.playground().registerCallback(draw, REFRESH_RATE);
                    $.playground().startGame();
                    let check_playground_size_warned = false;
                    const check_playground_size = () => {
                        if ((PLAYGROUND_WIDTH !== 640 || PLAYGROUND_HEIGHT !== 480)
                            && !check_playground_size_warned) {
                            check_playground_size_warned = true;
                            console.log("Warning: Non-standard playground sizes detected: " + PLAYGROUND_WIDTH + " x " + PLAYGROUND_HEIGHT);
                        }
                    };
                    setTimeout(check_playground_size, 200);
                    setInterval(check_playground_size, 3000);
                });
            });
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3FnLXN0YXJ0dXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJncWctc3RhcnR1cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7QUFDYjs7Ozs7R0FLRztBQUNIOzs7O0dBSUc7QUFDSCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBVzNFLElBQUksd0JBQXdCLENBQUM7QUFDN0IsSUFBSSxDQUFDLHdCQUF3QixFQUFFO0lBQzNCLHdCQUF3QixHQUFHLElBQUksQ0FBQztJQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7SUFDOUMsQ0FBQyxDQUFDLEdBQUcsRUFBRTtRQUNILElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxDQUFDLHVFQUF1RTtRQUVqRyxxRUFBcUU7UUFDckUscUhBQXFIO1FBQ3JILDJHQUEyRztRQUMzRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNqQixPQUFPLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7U0FDaEM7UUFFRCxJQUFJLFFBQVEsR0FBRyxDQUFDLEdBQVcsRUFBRSxRQUE4QixFQUFRLEVBQUU7WUFDakUsSUFBSSxhQUFhLEVBQUU7Z0JBQ2YsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNoQixPQUFPO2FBQ1Y7WUFFRCx5R0FBeUc7WUFDekcsSUFBSSxJQUFJLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQU0sRUFBUSxFQUFFO2dCQUMzQixJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssQ0FBQyxFQUFFO29CQUN2QixRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FB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QUcsSUFBSSxDQUFDOzRCQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLG1EQUFtRCxHQUFHLGdCQUFnQixHQUFHLEtBQUssR0FBRyxpQkFBaUIsQ0FBQyxDQUFDO3lCQUNuSDtvQkFDTCxDQUFDLENBQUM7b0JBQ0YsVUFBVSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUN2QyxXQUFXLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzdDLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0NBQ04iLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8qXG4gKiBDb3B5cmlnaHQgMjAxMiwgMjAxNiwgMjAxNywgMjAxOSwgMjAyMCBDYXJzb24gQ2hlbmdcbiAqIFRoaXMgU291cmNlIENvZGUgRm9ybSBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtcyBvZiB0aGUgTW96aWxsYSBQdWJsaWNcbiAqIExpY2Vuc2UsIHYuIDIuMC4gSWYgYSBjb3B5IG9mIHRoZSBNUEwgd2FzIG5vdCBkaXN0cmlidXRlZCB3aXRoIHRoaXNcbiAqIGZpbGUsIFlvdSBjYW4gb2J0YWluIG9uZSBhdCBodHRwczovL21vemlsbGEub3JnL01QTC8yLjAvLlxuICovXG4vKlxuICogR1FHdWFyZHJhaWwtR1Etc3RhcnR1cCBsb2FkcyBHUUd1YXJkcmFpbCBhbmQgZ2FtZVF1ZXJ5LlxuICogVGhpcyBzY3JpcHQgYXV0by1sb2FkcyBteXByb2dyYW0uanMuXG4gKiBQdXJwb3NlIGlzIHRvIGhpZGVzIHN0dWZmIHRvIG1ha2UgbXlwcm9ncmFtLmpzIGVhc2llciB0byBsZWFybi5cbiAqL1xuaW1wb3J0IHsgUExBWUdST1VORF9XSURUSCwgUExBWUdST1VORF9IRUlHSFQsIHNwcml0ZSB9IGZyb20gXCIuL2dxZy1tb2QudHNcIjtcbmRlY2xhcmUgdmFyICQ6IGFueTtcbmRlY2xhcmUgY29uc3QgR1FHX1BMQVlHUk9VTkRfSEVJR0hUOiBudW1iZXI7XG5kZWNsYXJlIGNvbnN0IEdRR19QTEFZR1JPVU5EX1dJRFRIOiBudW1iZXI7XG5kZWNsYXJlIHZhciBYTUxIdHRwUmVxdWVzdDogYW55O1xuZGVjbGFyZSB2YXIgY29uc29sZTogYW55O1xuZGVjbGFyZSB2YXIgZG9jdW1lbnQ6IGFueTtcbmRlY2xhcmUgdmFyIGRyYXc6IEZ1bmN0aW9uO1xuZGVjbGFyZSB2YXIgc2V0dXA6IEZ1bmN0aW9uO1xuZGVjbGFyZSB2YXIgd2luZG93OiB7IGNvbnNvbGU6IGFueSB9O1xuXG52YXIgZ3FndWFyZHJhaWxTdGFydHVwTG9hZGVkO1xuaWYgKCFncWd1YXJkcmFpbFN0YXJ0dXBMb2FkZWQpIHtcbiAgICBncWd1YXJkcmFpbFN0YXJ0dXBMb2FkZWQgPSB0cnVlO1xuICAgIGNvbnNvbGUubG9nKFwiZ3FndWFyZHJhaWwgc3RhcnR1cCBsb2FkaW5nLi4uXCIpO1xuICAgICQoKCkgPT4ge1xuICAgICAgICB2YXIgbG9jYWxMaWJzT25seSA9IHRydWU7IC8vIHNldCBmYWxzZSB0byB1c2UgQ0ROIGxpYnMgaWYgYXZhaWxhYmxlLCBlc3AuIGlmIGhvdCBwYXRjaGluZyBkZXNpcmVkXG5cbiAgICAgICAgLy8gQXZvaWQgY29uc29sZS5sb2cgZXJyb3JzIGluIGJyb3dzZXJzIHRoYXQgbGFjayBhIGNvbnNvbGUgKGkuZS4gSUUpXG4gICAgICAgIC8vIHNlZTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83NzQyNzgxL3doeS1qYXZhc2NyaXB0LW9ubHktd29ya3MtYWZ0ZXItb3BlbmluZy1kZXZlbG9wZXItdG9vbHMtaW4taWUtb25jZVxuICAgICAgICAvLyBmb3IgbW9yZSBjb21wbGV0ZSBzb2x1dGlvbiwgc2VlOiBodHRwczovL2dpdGh1Yi5jb20vaDVicC9odG1sNS1ib2lsZXJwbGF0ZS9ibG9iL21hc3Rlci9zcmMvanMvcGx1Z2lucy5qc1xuICAgICAgICBpZiAoIXdpbmRvdy5jb25zb2xlKSB7XG4gICAgICAgICAgICBjb25zb2xlID0geyBsb2c6ICgpID0+IHsgfSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHVybEV4aXN0ID0gKHVybDogc3RyaW5nLCBjYWxsYmFjazogKGI6IGJvb2xlYW4pID0+IHZvaWQpOiB2b2lkID0+IHsgLy8gY2FsbGJhY2sgaXMgY2FsbGVkIHdpdGggd2hldGhlciB1cmwgZXhpc3RzIChib29sZWFuKVxuICAgICAgICAgICAgaWYgKGxvY2FsTGlic09ubHkpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzZWU6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM2NDY5MTQvaG93LWRvLWktY2hlY2staWYtZmlsZS1leGlzdHMtaW4tanF1ZXJ5LW9yLWphdmFzY3JpcHRcbiAgICAgICAgICAgIHZhciBodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICBodHRwLm9wZW4oJ0hFQUQnLCB1cmwsIHRydWUpO1xuICAgICAgICAgICAgaHR0cC5vbmxvYWQgPSAoZTogYW55KTogdm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGh0dHAucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhodHRwLnN0YXR1cyAhPT0gNDA0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaHR0cC5vbmVycm9yID0gKGU6IGFueSk6IHZvaWQgPT4ge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBodHRwLnNlbmQobnVsbCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdHlwZSBMb2FkZXJGbiA9ICh1cmw6IHN0cmluZywgY2I6IEZ1bmN0aW9uKSA9PiB2b2lkO1xuICAgICAgICB2YXIgbG9hZENzczogTG9hZGVyRm4gPSAodXJsOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWQgPT4ge1xuICAgICAgICAgICAgdmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICAgICAgICAgICAgdmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgICAgICAgICBsaW5rLnJlbCA9IFwic3R5bGVzaGVldFwiO1xuICAgICAgICAgICAgbGluay50eXBlID0gJ3RleHQvY3NzJztcbiAgICAgICAgICAgIGxpbmsubWVkaWEgPSAnYWxsJztcbiAgICAgICAgICAgIGxpbmsuaHJlZiA9IHVybDtcblxuICAgICAgICAgICAgbGluay5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBjYWxsYmFjaztcbiAgICAgICAgICAgIGxpbmsub25sb2FkID0gY2FsbGJhY2s7XG5cbiAgICAgICAgICAgIGhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiTG9hZGVkIGNzczogXCIgKyB1cmwpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBsb2FkU2NyaXB0OiBMb2FkZXJGbiA9ICh1cmw6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZCA9PiB7XG4gICAgICAgICAgICAvLyBzZWU6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzk1MDA4Ny9pbmNsdWRlLWEtamF2YXNjcmlwdC1maWxlLWluLWFub3RoZXItamF2YXNjcmlwdC1maWxlXG4gICAgICAgICAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICAgICAgICB2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgICAgICAgc2NyaXB0LnNyYyA9IHVybDtcbiAgICAgICAgICAgIC8vc2NyaXB0LnR5cGU9XCJtb2R1bGVcIjsvL0NPUlMgdmlvbGF0aW9uIHdoZW4gcnVuIGxvY2FsbHlcblxuICAgICAgICAgICAgc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGNhbGxiYWNrO1xuICAgICAgICAgICAgc2NyaXB0Lm9ubG9hZCA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICBoZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiTG9hZGVkIHNjcmlwdDogXCIgKyB1cmwpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBsb2FkUnNyYyA9IChsb2FkZXI6IExvYWRlckZuLCBzY3JpcHROYW1lOiBzdHJpbmcsIGNkblVybDogc3RyaW5nLCBmYWxsYmFja1VybDogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkID0+IHtcbiAgICAgICAgICAgIC8vIGxvYWRlciBtdXN0IGJlIGxpa2UgbG9hZFNjcmlwdCh1cmwsIGNhbGxiYWNrKSwgb3IgbG9hZENzcyh1cmwsIGNhbGxiYWNrKVxuICAgICAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCAoKCkgPT4geyB9KTtcbiAgICAgICAgICAgIHVybEV4aXN0KGNkblVybCwgKHRoZVVybEV4aXN0czogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGVVcmxFeGlzdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyKGNkblVybCwgKCk6IHZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1VzaW5nIG9ubGluZSBDRE46ICcgKyBzY3JpcHROYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcihmYWxsYmFja1VybCwgKCk6IHZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1VzaW5nIGZhbGxiYWNrIGxpYjogJyArIHNjcmlwdE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIC8vIG1haW5cbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIC8vIEdpdENETiB3aWxsIHRha2UgdXAgdG8gMiBob3VycyB0byBwcm9wYWdhdGUgZmlsZSBjaGFuZ2VzXG4gICAgICAgIGNvbnN0IGdpdFJlcG9VcmwgPSBcImh0dHBzOi8vZ2l0Y2RuLnh5ei9jZG4vY2NoZW5nL0pRR1EtUHJvamVjdC1UZW1wbGF0ZS9cIjtcbiAgICAgICAgY29uc3QgZ2l0VGFnID0gXCJ2NS44XCI7IC8vIHVzZSBnaXRjZG4ueHl6L2NkbiBpbnN0ZWFkIG9mIC9yZXBvIHRvIGdldCBzcGVjaWZpYyBoYXNoIGluc3RlYWQgb2YgbGF0ZXN0IGNvbW1pdFxuICAgICAgICBjb25zdCBjZG5VcmxCYXNlID0gZ2l0UmVwb1VybCArIGdpdFRhZztcblxuICAgICAgICBjb25zdCBncWdMaWJQYXRoID0gXCJidWlsZC9ncWctbW9kLmpzXCI7IC8vIHJlbGF0aXZlIHRvIEdRRyBXZWIgQXBwIHByb2plY3Qgcm9vdFxuICAgICAgICBjb25zdCBtb2R1bGVIYWNrTGliUGF0aCA9IFwiYnVpbGQvZ3FnLW1vZHVsZS1Gbi5qc1wiO1xuICAgICAgICBjb25zdCBzdHVkZW50UHJvZ3JhbVBhdGggPSBcImJ1aWxkL215cHJvZ3JhbS5qc1wiO1xuXG4gICAgICAgIGxvYWRSc3JjKGxvYWRTY3JpcHQsIGdxZ0xpYlBhdGgsIGNkblVybEJhc2UgKyBncWdMaWJQYXRoLCBncWdMaWJQYXRoLCAoKSA9PiB7XG4gICAgICAgICAgICAvL2NvbnNvbGVQcmludChcIlVzaW5nOiBcIiArIGdxZ2xpYm5hbWUpO1xuXG4gICAgICAgICAgICBzcHJpdGUoXCJwbGF5Z3JvdW5kXCIpLnBsYXlncm91bmQoe1xuICAgICAgICAgICAgICAgIGhlaWdodDogR1FHX1BMQVlHUk9VTkRfSEVJR0hULFxuICAgICAgICAgICAgICAgIHdpZHRoOiBHUUdfUExBWUdST1VORF9XSURUSCxcbiAgICAgICAgICAgICAgICBrZXlUcmFja2VyOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1vdXNlVHJhY2tlcjogdHJ1ZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxvYWRSc3JjKGxvYWRTY3JpcHQsIG1vZHVsZUhhY2tMaWJQYXRoLCBjZG5VcmxCYXNlICsgbW9kdWxlSGFja0xpYlBhdGgsIG1vZHVsZUhhY2tMaWJQYXRoLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9hZFNjcmlwdChzdHVkZW50UHJvZ3JhbVBhdGgsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJSdW5uaW5nOiBcIiArIHN0dWRlbnRQcm9ncmFtUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiV2FybmluZzogTWFrZSBzdXJlIHlvdSBjb21waWxlZCB5b3VyIGNvZGUgYmVmb3JlIHRlc3RpbmchXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNldHVwKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIFJFRlJFU0hfUkFURSA9IDQxO1xuICAgICAgICAgICAgICAgICAgICAkLnBsYXlncm91bmQoKS5yZWdpc3RlckNhbGxiYWNrKGRyYXcsIFJFRlJFU0hfUkFURSk7XG4gICAgICAgICAgICAgICAgICAgICQucGxheWdyb3VuZCgpLnN0YXJ0R2FtZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGVja19wbGF5Z3JvdW5kX3NpemVfd2FybmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrX3BsYXlncm91bmRfc2l6ZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgoUExBWUdST1VORF9XSURUSCAhPT0gNjQwIHx8IFBMQVlHUk9VTkRfSEVJR0hUICE9PSA0ODApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgIWNoZWNrX3BsYXlncm91bmRfc2l6ZV93YXJuZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja19wbGF5Z3JvdW5kX3NpemVfd2FybmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIldhcm5pbmc6IE5vbi1zdGFuZGFyZCBwbGF5Z3JvdW5kIHNpemVzIGRldGVjdGVkOiBcIiArIFBMQVlHUk9VTkRfV0lEVEggKyBcIiB4IFwiICsgUExBWUdST1VORF9IRUlHSFQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGNoZWNrX3BsYXlncm91bmRfc2l6ZSwgMjAwKTtcbiAgICAgICAgICAgICAgICAgICAgc2V0SW50ZXJ2YWwoY2hlY2tfcGxheWdyb3VuZF9zaXplLCAzMDAwKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0iXX0=