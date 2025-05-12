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
