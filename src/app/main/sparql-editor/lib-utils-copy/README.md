The current directory contains utility classes copied from the [ontotext-yasgui](https://github.com/Ontotext-AD/ontotext-yasgui).

We need them in order to implement our own buttons controlling the rendering and the orientation of the editor, because we want to
place them somewhere else in the view, thus we need them detached from the editor itself.

When/If the utilities are exposes in standard way, we'll switch to them and delete our copies.
There is a possibility of having a component for the controls in the future, which will be even better.

Additionally, there are some modifications to the copied logic to fit our case and optimize the logic.
