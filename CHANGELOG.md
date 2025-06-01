## [1.13.1](https://github.com/drewzemke/synapse/compare/v1.13.0...v1.13.1) (2025-06-01)


### Bug Fixes

* build issues ([0abf4ab](https://github.com/drewzemke/synapse/commit/0abf4ab4116d4d7741daea597ec0af6186d2775d))
* **chat:** fix loading of existing conversation when `-e` was not passed ([e88e356](https://github.com/drewzemke/synapse/commit/e88e35685d9ed2c87c01cb07caea596d0ef5da06))
* **cli:** stop spinner when errors occur ([d9e932e](https://github.com/drewzemke/synapse/commit/d9e932e784e7c65d69d740b376398c3beb52b158))
* more build issues ([7676eff](https://github.com/drewzemke/synapse/commit/7676eff4218c3b6a7e4dca102f56eca60f523010))
* **pipeline:** don't test node 18 ([752e098](https://github.com/drewzemke/synapse/commit/752e0988221df1933558117abb9f6afc8a687951))

# [1.13.0](https://github.com/drewzemke/synapse/compare/v1.12.0...v1.13.0) (2025-05-30)


### Features

* **chat:** add /copy command ([54f3e5a](https://github.com/drewzemke/synapse/commit/54f3e5ab3d4277159cbe27b1f060595b96fb5127))

# [1.12.0](https://github.com/drewzemke/synapse/compare/v1.11.0...v1.12.0) (2025-05-22)


### Bug Fixes

* broken test ([6eb711a](https://github.com/drewzemke/synapse/commit/6eb711a741d883a02c45fc8ec29c09e900919099))


### Features

* **chat:** add /convo command ([d125435](https://github.com/drewzemke/synapse/commit/d1254352360b85f48cf6e9d6e2a3bcde27a6c648))
* **chat:** add initial impl of slash-commands ([9479fbe](https://github.com/drewzemke/synapse/commit/9479fbeb72df360233b20b204a47de9c01ddce86))
* **chat:** respect user config, add readme entry ([239c094](https://github.com/drewzemke/synapse/commit/239c09410f501063db9daa1b81928d8431ef6d1e))

# [1.11.0](https://github.com/drewzemke/synapse/compare/v1.10.0...v1.11.0) (2025-05-19)


### Features

* **chat:** improve spacing and prompt style ([80e8a70](https://github.com/drewzemke/synapse/commit/80e8a70a27049bf83db087a470ac1b6a3d5a7b2e))
* **chat:** initial impl of chat repl ([95a23f8](https://github.com/drewzemke/synapse/commit/95a23f8f240fba520f9c8bb88ab5e5f74716771e))

# [1.10.0](https://github.com/drewzemke/synapse/compare/v1.9.0...v1.10.0) (2025-05-18)


### Features

* **color:** tweak code coloring ([e491e36](https://github.com/drewzemke/synapse/commit/e491e36e5021c6ce17f9dc3d384983fee8e7f951))
* **spinner:** show a spinner while waiting for the first output ([b9d3971](https://github.com/drewzemke/synapse/commit/b9d39717b34005f705602a625a131e1570ecc8d0))


### Performance Improvements

* build with esbuild for better startup time ([e5ab960](https://github.com/drewzemke/synapse/commit/e5ab960cef6e0e48e04b9afb1d8ad7b4566da41c))

# [1.9.0](https://github.com/drewzemke/synapse/compare/v1.8.0...v1.9.0) (2025-05-17)


### Bug Fixes

* **color:** hide cursor while rendering code blocks ([dc1437c](https://github.com/drewzemke/synapse/commit/dc1437c6f245a728b31d4a42956f04e2fd3bb7d9))


### Features

* **color:** color code blocks while streaming :) ([1f7c880](https://github.com/drewzemke/synapse/commit/1f7c88097230da5f419470199901ca93d2c7bf21))
* **color:** print code blocks in boxes ([ce24258](https://github.com/drewzemke/synapse/commit/ce24258d85a75eb318c885a47f3c4544668d44ae))
* **config:** better control of color output from config and CLI ([66e935d](https://github.com/drewzemke/synapse/commit/66e935dc985439530c5ee1272fb5274742281b1c))
* **config:** better control of whether the output is streamed ([4d956ab](https://github.com/drewzemke/synapse/commit/4d956ab7331ad13697ab1a4ce818dd6ab329021a))

# [1.8.0](https://github.com/drewzemke/synapse/compare/v1.7.0...v1.8.0) (2025-05-17)


### Features

* **color:** improved highlighting algorithm, covering more classes, and better code block formatting ([3dec867](https://github.com/drewzemke/synapse/commit/3dec867b373a5421af7cfd3d4babe37aaba2abc1))

# [1.7.0](https://github.com/drewzemke/synapse/compare/v1.6.1...v1.7.0) (2025-05-12)


### Bug Fixes

* **config:** load default values correctly ([0526e84](https://github.com/drewzemke/synapse/commit/0526e84aeddf52aaa68a6cdda7822516cddf765e))


### Features

* **color:** add (experimental) code coloring to llm output ([7bc10be](https://github.com/drewzemke/synapse/commit/7bc10becd1c0d648c0e47c71b39d77620e09a888))

## [1.6.1](https://github.com/drewzemke/synapse/compare/v1.6.0...v1.6.1) (2025-05-11)


### Bug Fixes

* exit if no prompt is provided ([95b85da](https://github.com/drewzemke/synapse/commit/95b85dab8154ca238ee7d661bb1b36a5e9a37855))

# [1.6.0](https://github.com/drewzemke/synapse/compare/v1.5.0...v1.6.0) (2025-05-11)


### Features

* **providers:** add bedrock support ([83d518e](https://github.com/drewzemke/synapse/commit/83d518eb142ef185cb8ffb05f62dd27514b77401))

# [1.5.0](https://github.com/drewzemke/synapse/compare/v1.4.0...v1.5.0) (2025-05-11)


### Features

* **config:** add model specification to config ([8f06c56](https://github.com/drewzemke/synapse/commit/8f06c56fc08159737a489e744fbe8d87d6d545eb))
* **config:** simplify and improve config parsing/validation ([61a09aa](https://github.com/drewzemke/synapse/commit/61a09aa14a6e49c9b496157d6a691df51f2a377b))
* **profiles:** specify a default config in the "general" section of `config.yaml` ([69e9ae7](https://github.com/drewzemke/synapse/commit/69e9ae7751b882798cb0ea623e8a2146d63dd390))
* **providers:** specify a default model in `general` section of config.toml ([a2be203](https://github.com/drewzemke/synapse/commit/a2be2034c4dcf04c6f0a3978b210c0d262587691))
* **providers:** specify model from config with `-m` or `--model` ([4e7d17a](https://github.com/drewzemke/synapse/commit/4e7d17aa95497e62dcd77d3d96044a0814ebfa45))

# [1.4.0](https://github.com/drewzemke/synapse/compare/v1.3.1...v1.4.0) (2025-05-10)


### Features

* **cli:** print usage in verbose mode ([3c51fe0](https://github.com/drewzemke/synapse/commit/3c51fe0a73c19b89a0b5d663ff427a1bdfd7018e))
* **cli:** smoother streaming ([9f679dd](https://github.com/drewzemke/synapse/commit/9f679ddbf0b15f9a49e227d96a5fc36d7099a82f))

## [1.3.1](https://github.com/drewzemke/synapse/compare/v1.3.0...v1.3.1) (2025-05-10)


### Bug Fixes

* **cd:** re-format `package.json` after bumping version ([0eaedc4](https://github.com/drewzemke/synapse/commit/0eaedc4f83d6a17dd72a2df57a6e66663802508e))

# [1.3.0](https://github.com/drewzemke/synapse/compare/v1.2.0...v1.3.0) (2025-05-10)


### Features

* **cli:** `sy -l` to print the last response from the LLM ([4b0ba24](https://github.com/drewzemke/synapse/commit/4b0ba247ade2ff047539bbd022c95617016e6fcd))

# [1.2.0](https://github.com/drewzemke/synapse/compare/v1.1.2...v1.2.0) (2025-05-10)


### Features

* **continuation:** ability to extend previous conversations with `-e` ([d7a80bc](https://github.com/drewzemke/synapse/commit/d7a80bc34a9eb63ae6038016ba3aa262d038b39b))

## [1.1.2](https://github.com/drewzemke/synapse/compare/v1.1.1...v1.1.2) (2025-05-09)


### Bug Fixes

* replace toml with json for conversation storage type ([e99c3fb](https://github.com/drewzemke/synapse/commit/e99c3fb0ec69a12a2af69c255782d5f07fbc3819))

## [1.1.1](https://github.com/drewzemke/synapse/compare/v1.1.0...v1.1.1) (2025-05-09)


### Bug Fixes

* better handling of jsr toml package ([8117063](https://github.com/drewzemke/synapse/commit/811706372cd9ae14f31b8caca0a030fadfb6f0c0))

# [1.1.0](https://github.com/drewzemke/synapse/compare/v1.0.2...v1.1.0) (2025-05-09)


### Features

* **convo:** save convo to file ([1c60c80](https://github.com/drewzemke/synapse/commit/1c60c807ff414e3476c4f139e065ca3b1ec4bdee))

## [1.0.2](https://github.com/drewzemke/synapse/compare/v1.0.1...v1.0.2) (2025-05-08)


### Bug Fixes

* add git repo ref to package.json ([6a38c01](https://github.com/drewzemke/synapse/commit/6a38c017f238c9020cefeec19f9127caef048736))

## [1.0.1](https://github.com/drewzemke/synapse/compare/v1.0.0...v1.0.1) (2025-05-08)


### Bug Fixes

* **ci/cd:** update `cd` workflow permissions ([3d8eead](https://github.com/drewzemke/synapse/commit/3d8eeadd82d891f586c329f2a203bdc4a780e96b))

# 1.0.0 (2025-05-08)


### Bug Fixes

* **config:** use default profile when it defined in user config ([a0ae331](https://github.com/drewzemke/synapse/commit/a0ae331a139939246e4ed4255d630d75d67701e2))


### Features

* **cli:** read from piped input ([85fc052](https://github.com/drewzemke/synapse/commit/85fc05280e2e5006ec7aec21aa4e1ca4b3a93e51))
* **cli:** set up initial CLI with arg parsing ([bffbf4e](https://github.com/drewzemke/synapse/commit/bffbf4e4585aa6bfa48cb81cc7c551490593334e))
* **config:** add super-basic configuration via config file ([24ff736](https://github.com/drewzemke/synapse/commit/24ff736c2df7ecee5da7ce4036a63e98342561c3))
* **llm:** stream response from LLM provider to console ([5bedc2e](https://github.com/drewzemke/synapse/commit/5bedc2e0bc4959598d68a55466bfaed5cab2aff7))
* **profiles:** add ability to define profiles in configuration ([98e62d3](https://github.com/drewzemke/synapse/commit/98e62d3733a3173562b05afe8c3529f72615ae5c))
