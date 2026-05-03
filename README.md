<div align="center">
<h1>
  Vale's Tools
  
  [![Stars](https://img.shields.io/github/stars/DeclanChidlow/tools.vale.rocks?style=flat-square&logoColor=white)](https://github.com/DeclanChidlow/tools.vale.rocks/stargazers)
  [![Forks](https://img.shields.io/github/forks/DeclanChidlow/tools.vale.rocks?style=flat-square&logoColor=white)](https://github.com/DeclanChidlow/tools.vale.rocks/network/members)
  [![Pull Requests](https://img.shields.io/github/issues-pr/DeclanChidlow/tools.vale.rocks?style=flat-square&logoColor=white)](https://github.com/DeclanChidlow/tools.vale.rocks/pulls)
  [![Issues](https://img.shields.io/github/issues/DeclanChidlow/tools.vale.rocks?style=flat-square&logoColor=white)](https://github.com/DeclanChidlow/tools.vale.rocks/issues)
  [![Contributors](https://img.shields.io/github/contributors/DeclanChidlow/tools.vale.rocks?style=flat-square&logoColor=white)](https://github.com/DeclanChidlow/tools.vale.rocks/graphs/contributors)
  [![Licence](https://img.shields.io/github/license/DeclanChidlow/tools.vale.rocks?style=flat-square&logoColor=white)](https://github.com/DeclanChidlow/tools.vale.rocks/blob/main/LICENCE)
</h1>
A collection of handy little tools.
</div>
<br/>

An assorted variety of scoped, web-based tools following the ethos outlined in [Build, Use, and Improve Tools](https://vale.rocks/posts/build-use-and-improve-tools).

A `tools.json` file is generated in the root of the output directory so that it can be processed by my external content handling system, which is documented in [The Implementation of This Site](https://vale.rocks/posts/the-implementation-of-this-site#search) and allows these tools to appear on the [Vale.Rocks search page](https://vale.rocks/search).

## Creating A Tool

Create a new directory within `/src/tools`, and an `index.md` within it. A `script.js` and `style.css` file can be independently created within this directory and will be imported. `index.md` should include YAML frontmatter to indicate the title, description, and any applicable tags.
