# Flossbank

A JavaScript package manager wrapper (more languages to come) that shows in-terminal ads during installations to compensate open-source maintainers.

Find out more at https://flossbank.com

## Installation

```bash
$ npm install --global @flossbank/cli
```

We recommend adding an alias to your shell's startup scripts (e.g. `~/.bash_profile`) so that all calls to `npm` compensate open source maintainers:

```bash
alias npm="flossbank \npm"
```

Other package managers can be wrapped similarly:

```bash
alias yarn="flossbank \yarn"
```

## Usage
On first run, Flossbank will require you verify your email address (to curb abuse).

If you've aliased a package manger as mentioned above, the commands you usually type should not change.

```bash
npm install
```

or

```bash
yarn install
```

To run without aliasing, simply prepend `flossbank` to your `npm` or `yarn` commands:

```bash
flossbank npm install
```

## License
MIT