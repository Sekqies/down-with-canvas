We are done!

All of the last additions that I felt like were needed to ship this project are already made. Most of which where UI overhauls and quality of life changes, but there is a new change that deserves to be mentioned!

I noticed in some of my displays that a light that was supposedly covered by another object still casted lights in other meshes. I initially found that weird, but it makes sense: we never did any check for collision!
The change I immediately thought of was shadow mappings. Basically, you "render" the scene under the light's "perspective", and when applying shading to vertices, you check if there is any other object close it (in a pre-computed buffer). This seemed like the obvious high performance decision, but once again my plans were foiled by the absence of a pixel rasterizer. Implementing shadow mappings mean rasterizing my entire (svg) scene into 2D, and holding data the size of the screen, which is, surprisingly, worse than doing per-vertex analysis.

So, I had to implement raycasting. This is obviously expensive, but I thought of some optimizations tricks to make things faster (mainly seeing if the ray intersects with the mesh's bounding box before doing the per triangle calculations it usually does). It is still slow, but it is what it is.
I also deployed the project and changed the UI to be full screen, wrote some documentation, and got the readme up. This joke project turned out to be far bigger than I expected, so let's treat it with some respect!

Attached, our new UI, and shading!

**Commits**
[cf98b24](https://url.jam06452.uk/1rmlvi6): Added raytracing and shading
[86497b4](https://url.jam06452.uk/9r1fwl): UI Overhaul
[a8ae8b4](https://url.jam06452.uk/1e76s47): Add readme