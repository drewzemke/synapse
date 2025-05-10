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
