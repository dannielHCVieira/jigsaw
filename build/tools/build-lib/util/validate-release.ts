import {readFileSync, existsSync} from 'fs';
import {join} from 'path';
import {sync as glob} from 'glob';
import {buildConfig} from './build-config';

/** Path to the directory where all releases are created. */
const releasesDir = join(buildConfig.outputDir, '@rdkmaster');

/** RegExp that matches Angular component inline styles that contain a sourcemap reference. */
const inlineStylesSourcemapRegex = /styles: ?\[["'].*sourceMappingURL=.*["']/;

/** RegExp that matches Angular component metadata properties that refer to external resources. */
const externalReferencesRegex = /(templateUrl|styleUrls): *["'[]/;

/** Task that validates the given release package before releasing. */
export function checkReleasePackage(packageName: string): string[] {
  const bundlePath2015 = join(releasesDir, packageName, 'fesm2015', `rdkmaster-${packageName}.mjs`);
  const bundlePath2022 = join(releasesDir, packageName, 'fesm2022', `rdkmaster-${packageName}.mjs`);
  const bundleContent = existsSync(bundlePath2015) ? readFileSync(bundlePath2015, 'utf8') : (existsSync(bundlePath2022) ? readFileSync(bundlePath2022, 'utf8') : '');
  console.log("checkReleasePackage >>>>>> bundleContent: ", bundleContent.length);
  let failures = [];

  if (inlineStylesSourcemapRegex.exec(bundleContent) !== null) {
    failures.push('Bundles contain sourcemap references in component styles.');
  }

  if (externalReferencesRegex.exec(bundleContent) !== null) {
    failures.push('Bundles are including references to external resources (templates or styles)');
  }

  failures = failures.concat(checkJigsawPackage(packageName));

  return failures;
}

/** Function that includes special checks for the Jigsaw package. */
function checkJigsawPackage(packageName: string): string[] {
  const packagePath = join(releasesDir, packageName);
  const prebuiltThemesPath = join(packagePath, 'prebuilt-themes');
  const themingFilePath = join(packagePath, 'theming.scss');
  const failures = [];

  if (glob('*.css', {cwd: prebuiltThemesPath}).length === 0) {
    failures.push('Prebuilt themes are not present in the Jigsaw release output.');
  }

  if (!existsSync(themingFilePath)) {
      console.error("themingFilePath: ",themingFilePath);
      failures.push('The theming SCSS file is not present in the Jigsaw release output.');
  }

  return failures;
}
