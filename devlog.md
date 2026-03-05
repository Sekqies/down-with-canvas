The bottom line is that we've got a finished UI! Lots of work were made, so I'll keep my explanations short.

First, I wanted to add a way to allow an user to select a mesh and move it around with gizmos (the little colored arrows you see when you move an object around in, for instance, blender or gmod). To do this, we need a way for our scene to know where each object is. 
To do this, we normalize the coordinates of the user's map on the screen, turn it into a point in our 3D space, get another point very, very far back from the screen (your eyes!) and draw a line from these two points. We shift it into our camera's coordinates system, then, we see if it intersects something.
Rather than doing this vertex for vertex, we find an ellipsoid (a 3D ellipsis, or a squashed circle) and use it do bound our object, and use this ellipsoid to check for the intersection. This makes it so a mesh with 20k+ triangles will have instantenous collision checking!

All our other changes are essentially modifications to `Node` and tracking of different attributes one of these might have, like attaching a light, an animation, etc. Everything being a node made developing the UI far easier than I expected, and far, far less of a headache as I antecipated.

Attached, the culmination of everything we've done so far!


**Commits**
[c7d57d2](https://url.jam06452.uk/wqqfue): Added animations
[1d1e3bf](https://url.jam06452.uk/1onw8j7): Added point lights
[694c72d](https://url.jam06452.uk/xxy088): Added object importing and modularized Inspector
[bfe7ba1](https://url.jam06452.uk/88e4o0): Finished gizmos implementation
[1664107](https://url.jam06452.uk/13rtpp0): Gizmos working with absolute coordinates
[b18f978](https://url.jam06452.uk/wtguwn): Gizmos and state machine
[b617e9e](https://url.jam06452.uk/1mjzrnf): Added ellipsoid bounding box for Nodes 