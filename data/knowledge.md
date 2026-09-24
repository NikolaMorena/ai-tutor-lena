<!--
  KNOWLEDGE BASE
  ==============
  Source: "Introduction to Visual Computing - VU 186.822, Summary of the Lecture Units in
  Computer Graphics" (TU Wien, Research Unit of Computer Graphics, SS 2025), see
  data/EVC_Skriptum_CG_EN_v3.pdf. Text converted to Markdown; figures are replaced by short
  [Figure: ...] descriptions.

  Each topic starts with "## Topic name" and contains the text below it, up to the next "##".
  Use "###" / "####" for sub-sections inside a topic.
  The server reads this on startup and automatically:
    - builds the material sent to the model (each topic becomes "[MATERIAL N — name]")
    - builds the list of topics for the buttons in "Knowledge check" mode
  To add, edit or delete a topic: just edit this file and restart the server (or call
  POST /api/reload). There is no need to touch any .js file.
-->

## Introduction to Computer Graphics

Computer graphics refers to the branch of computer science that deals with artificially generated images and their manipulation. This also includes the digital representation, generation and manipulation of data.

### Who needs Computergraphics?

With the computerization of more and more areas of our lives, the number of applications that require artificial images is also increasing. The following list of typical applications is therefore incomplete.

#### Entertainment

The entertainment industry uses artificial images and animations in a variety of ways. The development of computer games is the application of computer graphics with the largest market worldwide, and the funds invested in this industry have a significant share in the relevant research. The film industry also frequently requires computer graphics, on the one hand, to depict scenes that could not be filmed or could only be filmed with immense effort, and, on the other hand, to rework filmed scenes and add content. The methods of classic film production and classic animation are merging more and more in this way.

#### Computer Aided Design (CAD)

Today, industrial products are generally developed and modeled on computers and, of course, visually inspected, i.e. represented with computer graphics. This applies to appliances, containers, sporting goods, and jewelry as well as cars, airplanes, and windows. In architecture, buildings are inspected virtually before they are built, and in road and landscape planning, the results are visually anticipated and taken into account in the planning process.

#### Advertising

Commercials have been using computer graphics support for a long time. Nor should the financially strong advertising industry be overlooked, which uses all kinds of manipulations of film material in addition to short animations. Companies that use modern interactive visual methods for marketing have a demonstrable image advantage.

#### Simulators

Learning to use some technologies can be either very expensive or dangerous. The training of airplane pilots and astronauts, even in extreme situations, has led to the development of very realistic-looking simulators whose technology is also used for simpler applications such as car simulation in driving schools. The simulation of other dangerous or catastrophic situations is also used to prepare and train people for them. Perception-based rendering, which takes into account the eye's ability to perceive under given circumstances, is also useful for this purpose.

#### Cultural Heritage

The preservation or restoration of things and buildings that have fallen victim to the ravages of time is possible virtually with computer graphics. In addition to museums, such programs also support normal education, for example history lessons.

#### Science

Visualization methods in particular make it possible to find structures and useful information in confusing or huge amounts of data. This is used exploratively in many sciences, but also routinely in medicine, for example (visualization of CT data, etc.).

### Computer Graphics Software Components

A graphics system comprises many components, from the modeling of the data to the efficient and correct display of the finished images. The resulting chain of operations and data is referred to as a graphics pipeline.

[Figure: The graphics pipeline as a chain: object coordinates → (model transformation) → world coordinates → (view transformation) → camera coordinates → (projection + homogenization) → normalized device coordinates → (viewport transformation) → pixel coordinates.]

In order to be able to display images without having to take into account the respective technology of the output device, so-called graphic primitives are used, which are simple geometric shapes such as straight lines, circles or rectangles. These are converted into pixel information using rasterization operations. Objects are modeled by combining geometric primitives and storing them in suitable geometric data structures (this also includes freeform surfaces), of which there are several different ones.

After placing the objects in a world coordinate system, the projection is determined by defining the corresponding camera parameters. Both operations require geometric transformations, which are usually represented as homogeneous matrices. Parts of the image that lie outside the viewing window must be omitted (clipping), as must image information that is obscured by other objects (visibility calculation).

For simple representations, simple illumination models are sufficient, which lead to shading of the object surfaces.

If realistic-looking images are required, then Ray-Tracing and/or global illumination calculation is used.

Furthermore, additional textures are often applied to surfaces, which can also be combined with local geometric structures. Finally, image output processes are used to reduce the raster impression of the output medium, so-called anti-aliasing.

## Graphics Pipeline and Object Representation

### Graphics Pipeline

Information is transformed into an image in successive steps: first, the objects and the scene are described in some way, then the viewing direction is determined, then the objects can be projected accordingly, and finally, the result is converted into raster points. This sequence is called the graphics pipeline or, depending on the way it is viewed, the viewing pipeline (top image), transformation pipeline or rendering pipeline (bottom image).

[Figure (top image, viewing pipeline): object coordinates → (model transformation) → world coordinates → (view transformation) → camera coordinates → (projection + homogenization) → normalized device coordinates → (viewport transformation) → pixel coordinates.]

[Figure (bottom image, rendering pipeline): object capture/creation → scene objects in object space → modeling, viewing, projection (vertex stage, "vertex shader") → transformed vertices in clip space → clipping + homogenization → scene in normalized device coordinates → viewport transformation, rasterization, shading (pixel stage, "fragment shader") → raster image in pixel coordinates.]

Objects can be created by modeling or by scanning. The terms "vertex shader" and "fragment shader" are used for programmable parts of graphics cards. Note that there are many other similar illustrations that all describe the same basic principle of the graphics pipeline. Most of the other graphics chapters in this script fit directly into this scheme.

#### Intermission: Graphs and Trees

Similar to linked lists, graphs in a general sense, and trees in a more specific sense, can be represented with pointer-linked structures. The individual nodes must contain a sufficient number of pointer components so that the desired structure can be achieved, e.g. two pointers per node for a binary tree. Operations for inserting and removing nodes can be easily considered in the same way as for linked lists. Furthermore, the processing sequence of such a data structure is controlled by calling the appropriate successors.

[Figure: A binary tree implemented with pointers: root node 1 has left child 2 and right child 3; node 2 has children 4 and 5; node 3 has children 6 and 7.]

The recursive processing of a binary tree can be controlled in this way, for example:

- "pre-order": 1st root, 2nd left successor, 3rd right successor (→ 1245367)
- "in-order": 1st left successor, 2nd root, 3rd right successor (→ 4251637)
- "post-order": 1. left successor, 2. right successor, 3. root (→ 4526731)

### Polygon Lists (B-Reps)

Three-dimensional objects are usually represented by polygon lists (often triangles). A set of polygons that describes the surface of an object is called a Boundary-Representation ("B-Rep"). In addition to geometric information, data structures for B-Reps also contain attributes (properties). The geometry consists of point lists, edge lists, and surface lists and must be checked for consistency and completeness.

The example on the left shows a very simple situation with 2 polygons and how the vertex table, edge table, and surface table reference each other. Only the vertex table contains the actual geometric information, the other tables only describe the topology.

[Figure: Two adjacent polygons S1 and S2 with vertices V1 to V5 and edges E1 to E6, described by these tables:]

| Vertex table | Edge table | Polygon table |
|---|---|---|
| V1: x1, y1, z1 | E1: V1, V2 | S1: E1, E2, E3 |
| V2: x2, y2, z2 | E2: V2, V3 | S2: E3, E4, E5, E6 |
| V3: x3, y3, z3 | E3: V3, V1 | |
| V4: x4, y4, z4 | E4: V3, V4 | |
| V5: x5, y5, z5 | E5: V4, V5 | |
| | E6: V5, V1 | |

The same structure can also be represented with pointer lists (see illustration on the right).

[Figure: A surface list (S1, S2) whose nodes point into an edge list (E1 to E6), whose nodes in turn point into a vertex list (V1 to V5, each storing x, y, z).]

The entire coordinate information is located in the point nodes (V stands for vertex). If a point is transformed to a new location, it is sufficient to change the coordinates of this point. The topology remains unchanged. The linear linking of edges and points makes editing easier (e.g. draw all edges once or move all points).

**Some Terms:** The representation of each individual polygon surface includes the support plane `Ax + By + Cz + D = 0` and the corner points V1 to Vn. From the plane parameters A, B, C, D you immediately get the normal vector on the plane (A, B, C). The Backface is the back of the polygon, which looks into the object, and the Frontface is the front, which shapes the outside of the object. "Behind the polygon" means all points that are visible from the back face, "in front of the polygon" means that you can see the front face from there.

In a right-handed coordinate system, assuming the corner points of each polygon (viewed from the front) are arranged in the mathematically positive sense (i.e. counterclockwise), then the following applies to a point (x, y, z):

- if `Ax + By + Cz + D = 0` then the point lies **on** the plane
- if `Ax + By + Cz + D < 0` then the point is **behind** the plane
- if `Ax + By + Cz + D > 0` then the point is **in front** of the plane

Similarly, an outwardly directed normal vector N can be calculated from three consecutive vertices V1, V2, V3 by `N = (V2 − V1) × (V3 − V1)`. We will need this knowledge later.

Very often, only triangles are used as polygons because they have many properties that simplify the algorithms (e.g. triangles are always flat). A data structure consisting exclusively of triangles is also called triangles-mesh; a linear sequence of triangles (each additional triangle is indicated by only one point!) is called triangle-strip (see figure).

[Figure: A triangle strip, a row of adjacent triangles where each new triangle shares an edge with the previous one.]

### Constructive Solid Geometry (CSG)

In CSG, objects are constructed from three-dimensional primitives using set operations. They are arranged in such a way that they can be arranged in a hierarchical data structure, which - although it is actually only a circle-free graph - is normally called a CSG tree. The primitives are simply geometric shapes such as spheres, tetrahedrons, cubes, and cylinders, which are linked with the operators union, average, and difference. Since all primitives are trivially consistent and the operators only generate consistent objects from consistent parts, all objects in CSG are always consistent (no holes in the surface, well-defined interior).

[Figure: A CSG tree: a sphere and a cylinder are combined by union; a box is subtracted from the result (difference); this is then intersected with another box at the root, each inner node showing the intermediate object.]

In addition, each node of a CSG tree contains transformations (in the form of matrices) that specify which transformations are applied to the subtree below. This gives primitives (e.g. axis-parallel unit cubes) a wide range of shapes (e.g. cuboids positioned anywhere in space), and even more complex objects can be moved, scaled, rotated, etc.

The advantages of CSG objects are the exact representation (a sphere is really a sphere!), the low memory requirements, and the simplicity of transformations. The main disadvantage is the much more complex calculation of images, i.e. the more complicated rendering. This requires either converting the entire data structure into a B-rep representation and rendering it in the conventional way, or using ray casting or ray tracing to create images directly.

#### Ray-Casting of CSG-Objects

The most common method for mapping CSG objects is ray casting, in which the image is calculated pixel by pixel. For each pixel, a ray is cast in the viewing direction and intersected with all objects in the scene. The foremost of these intersection points indicates which object can be seen in this pixel, and the pixel is given its color. In a CSG tree, this calculation is performed recursively:

- For **end node** the calculation of all intersection points is simple.
- For **intermediate node**, the intersection point lists of the two successors are linked according to the operator: the lists (A,B) and (C,D) in the example on the right result in
  - at union the list (A,D),
  - for average the list (C,B),
  - for difference the list (A,C).
- For **tree root**, the first point of the linked intersection list is selected.

[Figure: A ray from the pixel plane along z passes through two overlapping objects: it enters obj1 at A and leaves it at B, and enters obj2 at C and leaves it at D, in the order A, C, B, D.]

We will cover the topic of ray tracing, a superset of ray casting, in much more detail later.

### Quadtrees and Octrees

A Quadtree is a data structure that is suitable for representing any two-dimensional structure. The relevant area is divided into four quarters wherever the information is still too complicated to be stored simply, otherwise the simple information is stored. Each image area corresponds to a node of a tree in which each node has (at most) four successors ("quadtree").

[Figure: Quadrant numbering: 0 top left, 1 top right, 2 bottom right, 3 bottom left.]

The example opposite shows a simple quadtree that represents a two-color simple graph. The root node corresponds to the entire image, the nodes in the second row correspond to the top two quarters of the image and the last two nodes correspond to the two areas with the finest resolution.

An Octree is the extension of this concept to three dimensions. An arbitrarily shaped object (or even an entire scene) within a cube is represented by "simple" subcubes (empty or entirely within an object) being described by end nodes, and more complicated subcubes (all others!) being divided into eight smaller subcubes (octants), to which the same rules are applied again (recursively). This creates a tree in which each node has up to 8 successors ("octree"). The subdivision also stops when the subcubes fall below a certain minimum size (e.g. one thousandth of the total size); in this case, the node of the tree receives the best possible simple information. This happens at least with all slanted surfaces at some point, and then these edge cubes must be declared as either inside or outside. The example below with only two hierarchical levels also shows the problem of limited spatial resolution. The character string is an example of a linearization of the octree information, e.g. for saving in a file.

[Figure: An octree with octants numbered 1 to 8 and two hierarchical levels; its linearization is `X(EEEESX(EEEEEEES)SS)`, where E = Empty, S = Solid, X = Mixed.]

Octrees have the advantage that you can represent any shape and that you can quickly examine what is located at a certain spatial position. The disadvantages are: imprecise representation, high memory requirements, complicated transformations. Octrees are processed recursively in the same way as quadtrees. Set operations are therefore very simple, but geometric transformations (apart from exceptions) are complex because the octree has to be completely regenerated. The rendering of octrees, on the other hand, is simple when using an overwritable memory:

```
if node is simple
then draw node {i.e. do nothing if node is empty}
else recursively call the 8 octants from back to front
```

### Scenegraphs

A scene graph is an object-oriented data structure with which the logical and/or spatial arrangement of individual elements of a (two- or) three-dimensional scene is described hierarchically. This term is not precisely defined, it is rather a generic term for all possible hierarchical forms of description for objects that are to be represented graphically. In terms of graph theory, it is a tree-like directed circle-free graph whose root node represents the entire scene, each intermediate node describes a sub-scene (after all, it is the root of a partial "tree"), and the end nodes represent the simplest objects in the scene (these can also be very different representations). In OpenSceneGraph, VRML and X3D, scene graphs are central concepts.

As an example, let's think of a city scene where the entire scene graph represents the city. Each house corresponds to an intermediate node, each window also corresponds to an intermediate node, but further down in the "tree", and simple objects such as window panes or screws could be the simplest objects. If a part occurs more than once, then you can use the existing information several times in the scene graph, but then you need information on where and in what position and size these parts occur.

[Figure: A scene graph with root "world" and children sun, house, car, tree; house has walls and roof, walls has door and windows; car has body, engine and wheels; wheels has four "transf." nodes that all point to one shared "wheel" node.]

Intermediate nodes contain information that affects the entire subgraph, such as the material or color, the position and location in space, the size, and a possible distortion. All geometric transformations can be stored very elegantly in matrices - we will see how this works in the next chapter.

### Other Object Representations

There is a wealth of other object representations and associated data structures, some of which have been developed for very specific objects and applications. These include BSP trees, fractals, graphical grammars and procedural models, particle systems, physically based models, three-dimensional volume data, and some others. We will take a closer look at curved surfaces and freeform surfaces later. The other data structures will be covered in more advanced courses.

## Transformations

Geometric transformations are operations like moving, enlarging and reducing, rotating, mirroring, etc. objects within a coordinate system or between coordinate systems. We will always describe the necessary rules for points so that all other objects can also be easily transformed by transforming their defining points.

### Simple 2D Transformations

#### Translation

Moving a point (x, y) by the vector (tx, ty) provides the transformed point:

`(x′, y′) = (x + tx, y + ty)`

#### Rotation

By rotating an object with the angle θ around the coordinate origin, the point (x, y) due to `x = r·cosϕ` and `y = r·sinϕ` ⇒ `x′ = r·cos(ϕ+θ) = r·cosϕ·cosθ − r·sinϕ·sinθ = x·cosθ − y·sinθ` (y′ analog) is moved to

`(x′, y′) = (x·cosθ − y·sinθ, x·sinθ + y·cosθ)`.

[Figure: The point (x, y) at distance r from the origin and angle ϕ to the x-axis is rotated by the angle θ to (x′, y′) on the same circle of radius r.]

#### Scaling

When scaling an object by the factor s around the origin (0, 0), a point (x, y) is mapped to

`(x′, y′) = (s·x, s·y)`.

If different scaling factors sx and sy are used in the x and y directions, the result is

`(x′, y′) = (sx·x, sy·y)`.

#### Mirroring

Mirroring on a coordinate axis is a special case of scaling with `sx = −1` or `sy = −1`.

All other transformations can be achieved by carrying out the simple transformations described one after the other. These mappings (with the exception of translation) can also be represented by transformation matrices. The points are represented as vectors so that the matrix operations can be carried out with them:

- (a) Scaling: `(x′, y′) = [[sx, 0], [0, sy]] · (x, y)`
- (b) Rotation (counterclockwise): `(x′, y′) = [[cosθ, −sinθ], [sinθ, cosθ]] · (x, y)`
- (c) Mirroring around x-axis: `(x′, y′) = [[1, 0], [0, −1]] · (x, y)`
- (d) Translation: `(x′, y′) = (x + tx, y + ty)` ...?

### Homogeneous Coordinates

So that the translation can also be specified in matrix notation, homogeneous coordinates are used. Each point is assigned an additional coordinate h, whereby the conversion to 2D coordinates is carried out by dividing the x and y components by h. Therefore, h = 1 is usually used. For the point (x, y) we therefore write (x, y, 1). The transformation matrices are extended by a row and column with unit values:

- (a) 2D-Scaling: `(x′, y′, 1) = [[sx, 0, 0], [0, sy, 0], [0, 0, 1]] · (x, y, 1)`
- (b) 2D-Rotation: `(x′, y′, 1) = [[cosθ, −sinθ, 0], [sinθ, cosθ, 0], [0, 0, 1]] · (x, y, 1)`
- (c) 2D-Translation: `(x′, y′, 1) = [[1, 0, tx], [0, 1, ty], [0, 0, 1]] · (x, y, 1)`

Why is it advantageous to formulate all transformations in uniform matrix notation? In most cases, larger parts (objects, images) are transformed as a whole, i.e. the same sequence of transformations is applied to each point of these entities. This corresponds to a sequential multiplication of a point P with matrices M1, M2, M3, ...: `P′ = M1 · P, P′′ = M2 · P′, P′′′ = M3 · P′′, ...`. Now you can make use of the associativity of matrix multiplication [ i.e. `(M1 · M2) · M3 = M1 · (M2 · M3)` ] and thus massively reduce the computational effort:

**Instead of** `P(n) = Mn · (Mn−1 · ... (M3 · (M2 · (M1 · P))) ...)`
**we can write** `P(n) = (Mn · Mn−1 · ... · M3 · M2 · M1) · P`.

Now you can calculate `M = (Mn · Mn−1 · ... · M3 · M2 · M1)` beforehand and then apply this one total matrix to all points.

We want to give the simple transformation matrices names for a clearer presentation:

- **T(tx, ty)** = translation around the vector (tx, ty)
- **R(θ)** = rotation around the angle θ [pos. angle = counterclockwise rotation].
- **S(sx, sy)** = scaling by the factors sx and sy.

The inverse transformations of these simple transformations are:

`T^-1(tx, ty) = T(−tx, −ty)`    `R^-1(θ) = R(−θ)`    `S^-1(sx, sy) = S(1/sx, 1/sy)`

More complex transformations can now be derived from these simple transformations.

As an example, we consider the

#### Scaling around a point other than the coordinate origin:

1. step = Move the scaling center to the origin of the coordinates: `T(−xf, −yf)`
2. step = Scale the object in the coordinate origin: `S(sx, sy)`
3. step = Move the object back to the original position: `T^-1(−xf, −yf) = T(xf, yf)`

The general matrix for the scaling with (xf, yf) as the center is now obtained as follows:

`S(xf, yf, sx, sy) = T(xf, yf) · S(sx, sy) · T(−xf, −yf)`

[Figure: A triangle with fixed point (xf, yf) is moved so that (xf, yf) lies at the origin, scaled there, and moved back.]

As a further example, we consider the

#### Reflection on any axis y = mx + b:

1. step = move so that the axis passes through the origin of the coordinates: `T(0, −b)`
2. step = Rotate so that the axis coincides with the x-axis, for example: `R(−θ)` [`m = tanθ`]
3. step = mirroring on the x-axis: `S(1, −1)`
4. step = turn back so that the axis has the original angle: `R^-1(−θ) = R(θ)`
5. step = move back so that the axis is at the original position: `T^-1(0, −b) = T(0, b)`

The general matrix for the reflection on the axis y = mx + b is now obtained as follows:

`X(m, b) = T(0, b) · R(θ) · S(1, −1) · R(−θ) · T(0, −b)`

Another important transformation is the shear, which in the simplest case in the x-direction with a fixed x-axis has the form:

`[[1, shx, 0], [0, 1, 0], [0, 0, 1]]`

[Figure: The unit square (0,0), (1,0), (1,1), (0,1) is sheared in x-direction into a parallelogram with top corners (shx, 1) and (shx+1, 1).]

More generally, the shearing can also take place parallel to an axis, which looks like this in the y-direction:

`[[1, 0, 0], [shy, 1, −shy · xref], [0, 0, 1]]`

[Figure: A square is sheared in y-direction by shy relative to the vertical reference line x = xref.]

Of course, you can now easily derive the general matrix for a shear that is not parallel to one of the coordinate axes: first rotate to a position parallel to the axis, then shear, and then rotate back again.

The general viewing transformation can also be easily described using transformation matrices. The operations used are shifting one origin to the other, rotating the viewport in the axis directions of the window, and scaling the axes. In contrast to the composite transformations discussed above, however, there is no backward rotation, backward shifting, etc. here.

#### Affine Transformations

All transformations discussed here are affine transformations, i.e. the coordinates can be transformed into each other using linear functions plus a translation. Affine mappings maintain collinearity, i.e. (each of) 3 points on a straight line are also on a straight line after the mapping, and the proportionality of distances along a straight line, i.e. the ratio of lengths on a straight line, is maintained. Furthermore, parallel lines always remain parallel, and finite points remain finite. All affine transformations can be composed of scaling, rotation, and translation (including shearing!). Affine transformations in which only rotation, translation, and mirroring are used are also length- and angle-preserving.

### 3D Transformations

All 2D concepts can be easily extended to 3D. Again, you need a homogeneous component so that 4x4 matrices operate on 4-dimensional vectors. Later we will see that projections can also be formulated in this way.

Here are the most important 3D transformations (each applied as `(x′, y′, z′, 1) = M · (x, y, z, 1)`):

- (a) 3D-Scaling: `[[sx, 0, 0, 0], [0, sy, 0, 0], [0, 0, sz, 0], [0, 0, 0, 1]]`
- (b) 3D-Translation: `[[1, 0, 0, tx], [0, 1, 0, ty], [0, 0, 1, tz], [0, 0, 0, 1]]`
- (c) Mirroring around yz/xz/xy plane:
  - yz plane: `[[-1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]`
  - xz plane: `[[1, 0, 0, 0], [0, -1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]`
  - xy plane: `[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, -1, 0], [0, 0, 0, 1]]`
- (d) 3D Rotation around x-axis: `[[1, 0, 0, 0], [0, cosθ, −sinθ, 0], [0, sinθ, cosθ, 0], [0, 0, 0, 1]]`
- (e) 3D Rotation around y-axis: `[[cosθ, 0, sinθ, 0], [0, 1, 0, 0], [−sinθ, 0, cosθ, 0], [0, 0, 0, 1]]`
- (f) 3D Rotation around z-axis: `[[cosθ, −sinθ, 0, 0], [sinθ, cosθ, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]`

The names for these simple transformation matrices are

- **T(tx, ty, tz)** = translation around the vector (tx, ty, tz)
- **Rx(θ)** = rotation by the angle θ around the x-axis; y- and z-axis analogous
- **S(sx, sy, sz)** = Scaling by the factors sx, sy and sz.

As an example of a more complex transformation, let's use a

#### Rotation by the angle θ around any axis in space

can be derived. Let the axis be given by a point P1(x1, y1, z1) and a direction vector u.

[Figure: Six sketches of the steps: the axis through P1 with direction u; (1) P1 moved to the origin; (2) u rotated into the z-axis; (3) rotation by θ around the z-axis; (4) u rotated back; (5) P1 moved back to its original position.]

1. step = move point P1 to the origin: `T(−x1, −y1, −z1)`
2. step = rotate vector u in the z-axis
   - (a) Rotate vector u around the x-axis in the xz-plane: `Rx(α)`. If `u = (a, b, c)`, then `u′ = (0, b, c)` is the projection of u onto the yz-plane. The angle of rotation α around the x-axis results from `cosα = c/d` with `d = sqrt(b² + c²)`
   - (b) Rotate vector u around the y-axis into the z-axis: `Ry(β)`. The angle of rotation β around the y-axis results from `cosβ = d` (or `sinβ = −a`)
3. step = perform rotation by θ around the z-axis: `Rz(θ)`
4. step = rotate vector u back in the original direction: first `Ry(−β)`, then `Rx(−α)`
5. step = move point P1 back to the original position: `T(x1, y1, z1)`

The resulting matrix is calculated as follows:

`R(θ) = T^-1(−x1, −y1, −z1) · Rx^-1(α) · Ry^-1(β) · Rz(θ) · Ry(β) · Rx(α) · T(−x1, −y1, −z1)`
`     = T(x1, y1, z1) · Rx(−α) · Ry(−β) · Rz(θ) · Ry(β) · Rx(α) · T(−x1, −y1, −z1)`

[Figure: Step 2a shows u rotated by α around the x-axis into the xz-plane; step 2b shows it rotated by β around the y-axis into the z-axis.]

#### Shear in 3D

A shear in 3D is also easy to display: A shear parallel to the xy-plane by the value a in the x-direction and the value b in the y-direction can be achieved using

`[[1, 0, a, 0], [0, 1, b, 0], [0, 0, 1, 0], [0, 0, 0, 1]]`

[Figure: A cube whose front face is shifted by a in x-direction and by b in y-direction, while the back face in the xy-plane stays fixed.]

A shear with a fixed plane other than one of the coordinate principal planes can be easily derived.

## Color

Color is one of the basic essences of computer graphics. Understanding and handling color correctly is a basic tool for computer graphic artists. However, the commonly used RGB color model is not capable of representing all colors and is otherwise very approximate. Many color calculations are usually only approximate (which is often sufficient), and exact color theory is very complex.

### What is Color?

Our eye can detect electromagnetic radiation in the rather narrow frequency range between about 3.8 · 10^14 Hz (≈ 780 nm) and 7.8 · 10^14 Hz (≈ 380 nm). We perceive this radiation as light. This visible range varies slightly from person to person, and many animals have different limits. Other frequency ranges serve other purposes (see diagram). Our eyes can even distinguish the frequency of the radiation within the visible range, which we then perceive as different colors. We perceive long-wave light (i.e. lower frequency) as red, and short-wave light (i.e. higher frequency) as blue to violet. All rainbow colors lie in between.

[Figure: The electromagnetic spectrum from long to short wavelength: AM radio, FM radio and TV, microwaves, infrared, visible light, ultraviolet, X-rays.]

[reminder: `c = λ · f`, where c ... lightspeed, λ ... wavelength, f ... frequency]

In fact, spectrally pure light (which only has exactly one wavelength) rarely occurs in nature, but we usually see a mixture of many colors (spectrum). Frequencies with more energy then determine which color we perceive, one speaks of dominant wavelength. If all components are (approximately) the same size, we see a colorless light (i.e. white or grey). If ED is the energy of the dominant wavelength and EW is the average energy of the other wavelengths, then `(ED − EW) / ED` is called the purity of a color. The brightness results as the area (integral) under the spectral curve.

[Figure: Two energy-over-wavelength spectra: white light with roughly equal energy from 400 nm to 700 nm, and greenish light with a peak of energy ED at the dominant wavelength above an average level EW.]

### Colorimetry

Colorimetry is the science of the technical description of colors. The aim is to describe a color by numbers, by exact specifications. However, since a color is a perceived sensory impression and not a physically directly measurable quantity, only the visual stimulus can be defined numerically (i.e. what a person sees) in such a way that

1. Stimuli with the same specifications look the same under the same conditions,
2. Stimuli that look the same have the same specifications,
3. The numbers used are continuous functions of the physical parameters (i.e. small changes in the numbers cause small changes in the colors and vice versa)

[Figure: object → light stimulus → eye → nerve signal → brain; the part up to the eye (electromagnetic rays) is the realm of direct observables, the part after it (color sensation) the realm of psychology.]

Colorimetry therefore only takes into account the visual distinguishability of electromagnetic radiation. All spectra that produce the same color impression are indistinguishable in this sense and form an equivalence class in the color space.

The retina of the eye, i.e. the light-sensitive layer at the back of the eyeball, contains around 120 million rods and cones. Rods cannot distinguish colors, but they are very sensitive to light. Cones are much less easily activated, but there are three different types, each of which is sensitive to a different wavelength range (the sensitivity curves are shown in the diagram on the right). Our color perception is therefore made up of the combination of three separate "non-colored" scalar signals, which is why human color perception is called Tristimulus. The sensitivity curves of the three cone types have their maxima at red, green, and blue, so it is quite appropriate to speak of red, green, and blue cones. The brain mixes these three values together to form a color. This is also the basis for the fact that the eye can be fooled into seeing "all" colors by composing a color from 3 basic colors. If you place small points of light in red, green, and blue close enough to each other, we perceive this as a point in the color mixed in this way additive.

#### Color Vision Deficiency

In some people, one type of cone (or even two) is missing due to hereditary factors or the sensitivity curves of the cones are not sufficiently different, in which case the ability to distinguish as many different colors as most people is missing. This is called color weakness or color blindness. The most common type is red-green blindness, where the red and green cones react to wavelengths that are too similar. About 8% of all men are at least slightly color blind! Test images, in which the information can only be recognized if certain (e.g. reddish and greenish) tones of the same brightness can be distinguished (see image), are used to diagnose color vision deficiency. As you can cope very well in life with reduced color vision, many people are unaware of their impairment.

### Color Models

#### CIE 1931 XYZ color model

The XYZ color system is obtained directly from the tristimulus theory. To do this, color comparison experiments are used to determine which combination of the 3 primary colors produces which test color. For each spectrally pure test color, test subjects must dose red, green and blue light with three controls so that the same color is produced. Some colors cannot be produced from such a combination, which is why it is sometimes necessary to use negative components, which is done by mixing in some light of a basic color on the test color side. After a transformation into positive numbers, we obtain "imaginary primary colors" X, Y, and Z. If the colors generated in this way are standardized to brightness 1 and the result is projected onto the XY plane, we obtain the CIE diagram, which was standardized by the Commission Internationale d'Eclairage (CIE) in 1931. The colors are described by the coordinates (x, y), from `x + y + z = 1` follows z. In addition, the brightness can be specified, this is denoted by Y. Thus, a complete color definition is given by (x, y, Y).

In the CIE 1931 diagram, all spectrally pure colors are located at the U-shaped outer edge. Between the end points of this line runs the so-called purple line, which contains complementary colors of spectrally pure colors, but which themselves do not have only one wavelength. Each point in the diagram corresponds to a different color. A linear combination of two colors is located on the straight line between these two colors. The color white lies approximately in the middle. Complementary colors lie on opposite ends of straight lines that pass through the white point. The colors that can be displayed with an RGB monitor, i.e. the linear combinations of the colors red, green and blue that the monitor can produce, all lie within the triangle spanned by these three points (see sketch). Since there are no three colors that contain the entire diagram, no monitor can display all colors.

#### RGB color model

In addition to color spaces (actually color space descriptions) such as the CIE model, which are capable of describing all colors, there are color spaces for describing the colors of a device. For screens, we almost always use the RGB model. A pixel is composed of three small color dots, whose light sum (additive color mixing! - see sketch with the circles) creates a color impression. Depending on the technology used and the specific materials, each monitor has slightly different basic colors, from which different subsets of all colors can be generated. The space of colors that a device can generate is called its Gamut.

#### CMY color model

The mixing of colored ink on a sheet of paper is subject to completely different rules than the additive color mixing of light. The more ink you use, the darker the result will be because you are actually applying a filter in front of the passively reflecting paper, which is why it is called subtractive color mixing (see sketch with the circles). The CMY model is the complement of the RGB space. For simple applications, the following therefore applies

`[C, M, Y] = [1, 1, 1] − [R, G, B]`

The CMYK model is also often used. K stands for key, which corresponds to the color black. When printing, all gray components are printed separately with black ink instead of producing them as a mixture of equal proportions of cyan, magenta and yellow, which is more expensive and worse.

#### HSV and HLS color models

In addition to the color spaces that make sense for devices, there are also descriptions of the colors in a way that accommodates the human user. We can only describe a target color from the components R, G, B, or C, M, Y with great difficulty and a lot of practice. Our usual descriptions of colors are made up of qualities such as a name, brightness, and color purity. Therefore, color systems that function in these three dimensions are used for the user interface to define colors. These include HLS, HSV, Munsell, RAL, NCS, Coloroid, and some others.

HSV stands for Hue, Saturation and Value. Hue refers to the color along a color wheel that goes from red to orange, yellow, green, cyan, blue, violet, magenta and back to red. If you look at the RGB cube exactly in the direction of its gray axis, you will see this color circle as the boundary of the resulting hexagon (illustration). Saturation means saturation and indicates how pure a color is, i.e. how strongly it differs from grey. Value means value and indicates something like the brightness of the color.

The darker a color is, the fewer gradations of saturation there are. As a result, all colors can be represented in a pyramid whose apex is black and whose base is the color hexagon (fig. left). The color is specified in degrees along the base edge (red=0°, green=120°, blue=240°), the saturation as a percentage of the distance from the pyramid axis and the brightness as a percentage of the distance of the base from the tip. A medium-bright saturated yellow thus has the HSV value (60, 1, 0.5).

The HLS system (also HSL) works in a very similar way, where H=Hue, L=Lightness or Luminance, S=Saturation. This time, however, the shape of the model is a double cone, which is white at the top and black at the bottom (fig. right). The background is the assumption that white is much brighter than any pure color.

If you now look at the typical color dialogs of a desktop program, you will recognize the use of these user-oriented color systems. Usually you have several color models to choose from, often you can also enter the values by numbers. It is an interesting experience to try to achieve a certain color tone in a certain brightness by specifying the RGB numbers.

### Color Symbolism

Colors are companions in everyday life. The use and meaning of colors can diverge between different cultures. Some attributions of meaning apply across cultures, but only within a particular field. The following lines provide some examples.

#### Language usage

Every language has a basic vocabulary for colors. Depending on the language, there are between 2 and 20 basic terms for colors and further terms for nuances. In German, it is assumed that there are 6 to 11 basic terms and around 150 to 200 additional terms (e.g. olive). In other languages this is often different, for example in Italian there are two terms for blue: azzuro (sky) and blu (dark blue captain's uniform). In Hungarian, there are two reds: piros and vörös.

#### Color in religion

In spirituality, colors are often attributed symbolic power and cultural or religious content. This is why there is a sacred color in all regions of the world (apart from Christianity!). In Islam, for example, green is the favorite color of the religious founder Mohammed. Many Islamic state flags have the basic color green, such as the Saudi Arabian flag (pictured right).

#### Colors in politics

In politics, colors are assigned to both political movements and parties. Colors serve as a uniform distinguishing feature. For example, red is the color of Marxism-Leninism, socialism and the labor movement. Green is often the color of environmental organizations and parties.

#### Labeling

Colors are also used as a stand-alone identifier. The color itself stands for a certain purpose and is often used without further explanation. Examples include red and blue markings on taps.

#### Colors in traffic

Colors are deliberately used as information in traffic signs, lights and traffic lights. Prohibition and danger signs are generally red/white, while mandatory and information signs are blue/white. The traffic lights are red/yellow/green. Pass red marker lights on the left and white marker lights on the right.

#### Colors in technology

In technical applications, colors are also often used to describe certain parts. For example, the phase, neutral conductor and earthing of electrical cables can be identified by the color of the wire.

#### Colors in nature

Nature also makes use of color. Many bird species wear colorful mating plumage or have colorful beaks to attract females. In nature, colors also serve as camouflage or as a warning to predators.

#### Associations with colors

Depending on the culture, people associate certain feelings and associations with many colors. blue, the color of the sky, stands for the vastness, the distance and for concepts that are easy to associate with it (longing, fantasy). Red is the color of blood. However, it not only stands for war and death, but also for vitality (passion, love, anger). Green stands for lush meadows, forests and nature. This is why people like to talk about green fingers or city dwellers like to go out into the countryside. Green is also associated with hope and confidence. Summer, sun and joie de vivre are associated with yellow. Yellow is the color of light and gold. Yellow is radiant. However, yellow is ambivalently associated with envy, avarice, jealousy, selfishness and mendacity. Black is associated with death, endings and emptiness. Black is also the color of mourning, for people with "white" skin color. In contrast, white is seen as a perfect color (many people with dark skin use white to express their sadness and black as a color of joy).

## Rasterization

In order to generate graphical output on a device, the programming language used must provide commands for this. The simple graphic building blocks that can be generated with these commands are also called graphic primitives. In addition to simple drawings, these building blocks also include formatting instructions and meta information. The most important such commands are

- In 2D:
  - Points, Lines
  - Polygons, circles, ellipses and other curves (all also filled)
  - Bitmap operations
  - Letters and characters
- In 3D:
  - Triangles and other polygons
  - Free-form surfaces

You also need commands to define the properties of the primitives, e.g. color, fill pattern, texture, material property, and transparency. These commands usually cause all primitives created afterward to take on the properties defined last.

### Line algorithms

Drawing straight lines on raster devices is a particularly important operation. The basic DDA (Digital Differential Analyzer) method was cleverly redesigned by Bresenham so that it only requires integer operations, making it faster and easier to implement in hardware.

Notation: A line is given in the form `y = mx + b`, where m describes the slope of the line and (0, b) is the point of intersection with the y-axis.

From the endpoints (x0, y0) and (x1, y1) of the line, m and b can be calculated:

- `m = (y1 − y0) / (x1 − x0)`
- `b = y0 − m·x0`

#### DDA Procedure

The simple DDA algorithm for |m| < 1 adds the value m to y0 for each step to the right (x += 1) and then rounds the result to whole numbers. This creates a line in which exactly one pixel is generated for the line for each x value.

```
dx = x1 - x0; dy = y1 - y0;
m = dy / dx;

x = x0; y = y0;
setPixel (round(x), round(y));

for (k = 0; k < dx; k++) {
    x += 1; y += m;
    setPixel (round(x), round(y));
}
```

For |m| > 1, x and y are swapped and the process is carried out in a vertical direction. The following Bresenham algorithm is also only shown for 0 < m < 1, the other directions are obtained by mirroring and rotating by 90°.

#### Bresenham Algorithm

The Bresenham algorithm produces exactly the same result as the simple DDA, but uses only integer arithmetic. It is therefore faster, easier to implement in firmware or hardware, and can also be easily adapted for other curves, e.g. circles, ellipses, spline curves, etc.

For 0 < |m| < 1, the exact y-value is not calculated for x_{k+1} based on the known position of the pixel in the x_k column, but a decision is merely made as to whether y_k or y_{k+1} is closer to the exact y-value.

[Figure: pixel grid with the line passing between pixel centers y_k and y_{k+1} at column x_{k+1}; d_lower is the distance from y_k up to the exact y, d_upper the distance from the exact y up to y_{k+1}.]

From `y = mx + b` the exact y-value follows for the column to the right of x_k:

`y = m · (x_k + 1) + b`

The distance to y_k is `d_lower = y − y_k = m(x_k + 1) + b − y_k`, the distance to y_{k+1} is `d_upper = (y_k + 1) − y = y_k + 1 − m(x_k + 1) − b`.

If the difference `d_lower − d_upper = 2m · (x_k + 1) − 2y_k + 2b − 1` is negative, then the lower point (x_{k+1}, y_k) is selected; if it is positive, (x_{k+1}, y_{k+1}) is selected.

If you set `m = ∆y/∆x` (with `∆x = x1 − x0`, `∆y = y1 − y0`) and multiply this difference by ∆x, you get a decision variable:

`p_k = ∆x · (d_lower − d_upper) = 2∆y · x_k − 2∆x · y_k + c`,

which has the *same sign* as `d_lower − d_upper`, but does not require division.

Now you can easily use the decision variable for x_k: `p_k = 2∆y · x_k − 2∆x · y_k + c` to calculate the decision variable for x_{k+1}:

`p_{k+1} = 2∆y · x_{k+1} − 2∆x · y_{k+1} + c + p_k − 2∆y · x_k + 2∆x · y_k − c = p_k + 2∆y − 2∆x · (y_{k+1} − y_k)`

simply by adding a number that remains constant for all points on the line. The initial value is of course `p_0 = 2∆y − ∆x`.

The Bresenham algorithm thus looks something like this:

```
1. store left line endpoint in (x0, y0)
2. plot pixel (x0, y0)
3. calculate constants ∆x, ∆y, 2∆y, 2∆y − 2∆x, and obtain p0 = 2∆y − ∆x
4. At each xk along the line, perform test:
      if pk < 0
      then plot pixel (xk+1, yk);   pk+1 = pk + 2∆y
      else plot pixel (xk+1, yk+1); pk+1 = pk + 2∆y − 2∆x
5. perform step 4 (∆x − 1) times.
```

Example for ∆x = 10, ∆y = 3 (line from (20, 41) to (30, 44)):

| k | p_k | (x_{k+1}, y_{k+1}) |
|---|-----|--------------------|
|   |     | (20,41) |
| 0 | -4  | (21,41) |
| 1 | 2   | (22,42) |
| 2 | -12 | (23,42) |
| 3 | -6  | (24,42) |
| 4 | 0   | (25,43) |
| 5 | -14 | (26,43) |
| 6 | -8  | (27,43) |
| 7 | -2  | (28,43) |
| 8 | 4   | (29,44) |
| 9 | -10 | (30,44) |

### Attributes

Graphic primitives can be created with many different properties, so-called *attributes*.

#### Attributes of (points and) lines

In addition to generally known properties of lines, such as stroke thickness, stroke pattern, color, or brush type, there are a few attributes that are often less obvious. These include the line ends for wider lines and the shape of corners for wide lines.

[Figure: three line-end styles for wide lines (flat/butt, rounded, projecting square) and three corner (join) styles for wide polylines (miter/pointed, rounded, beveled).]

Antialiasing is also an issue for lines, details of which are provided below.

#### Attributes of Text

The properties that text can take on are now largely common knowledge: Font (e.g. Courier, Helvetica, Times, Fraktur, ...), style (normal, bold, italic, underlined, ...), size, direction, color, alignment (left, right, center, justified) and so on.

Fonts with serifs (above) are better suited for continuous text, and fonts without serifs for bold text. Fonts are normally represented by defining the outline curves of the letters and, for some applications also by pixel grids.

#### Attributes of (2D) polygons and surfaces

It is clear that the attributes of the edge of areas are the same as those of lines. In addition, there is now the surface itself, which can be provided with a fill. Patterns are usually created by repetitively stringing together a basic pattern starting from a reference point (also known as a seed point).

In many applications, it is also necessary to create a combination of the newly drawn pattern with the background. There are many variants here, which are often based on logical links: AND, OR, XOR. The mixing of colors is usually done by a linear combination of the existing background color B with the foreground color F to be drawn: `P = t · F + (1 − t) · B`

### Barycentric coordinates

Barycentric coordinates are a basis for the interpolation of pixels in triangles.

#### Rasterizing triangles

To fill triangles, you often use *barycentric coordinates*. Each point of the plane is represented as the weighted average of the three vertices of the triangle:

`P = αP0 + βP1 + γP2`

(α, β, γ) are then called the barycentric coordinates of the point P, whereby the following always applies: `α + β + γ = 1`. All points with (0 < α < 1, 0 < β < 1, 0 < γ < 1) lie within the triangle; as soon as one of these values is negative or greater than 1, the point lies outside the triangle.

[Figure: triangle P0(x0, y0), P1(x1, y1), P2(x2, y2) with barycentric coordinates (1,0,0), (0,1,0), (0,0,1) at the vertices and an interior point with coordinates (0.60, 0.13, 0.27).]

To fill a triangle, calculate the barycentric coordinates for each pixel of a (preferably narrow) environment and draw all pixels for whose center (0 < α < 1, 0 < β < 1, 0 < γ < 1) applies. It is very easy to calculate any corner point attributes (e.g. color) in each pixel weighted with (α, β, γ), this corresponds to a linear interpolation of these values.

#### Calculation of the barycentric coordinates

If `g12(x, y) = a12·x + b12·y + c12 = 0` is the carrier line through the points P1 and P2, then α of the point P(xp, yp) is calculated as

`α = g12(xp, yp) / g12(x0, y0)`.

β and γ are calculated analogously.

In order to avoid drawing the edges of adjacent triangles twice, only pixels are drawn whose center point must lie within an (exact) triangle. Pixels exactly on an edge must be treated specially, e.g. by rules such as "edges at the bottom and right are rendered, edges at the top and left are not". This ensures that each edge pixel is only treated once.

### What is the inside of a polygon

Before you start filling surfaces, you have to ask yourself what is to be filled. For a simple closed curve, "inside" is easy to define, but what about more complicated curves?

[Figure: the same self-intersecting polygon filled in three different ways ("like this? or this? or this?"), with differing regions counted as inside.]

**Odd-Even-Rule:** If you draw any half ray from a point, the point is inside if the number of intersections with the curve is odd, otherwise, the point is outside (top left in fig. and all images on the right). Each edge therefore has one side inside and the other outside.

**Nonzero-Winding-Number-Rule:** Points are outside if there are the same number of clockwise and counterclockwise curve edges on any half-beam, otherwise, they are inside (in the top center of the figure, as well as all images on the right).

**All-In-Rule:** Everything that is somehow enclosed is inside. Rarely used, mostly in poker :) (top right in illus.).

A polygon is called *convex* if all internal angles are less than 180° (top image), otherwise *concave* (bottom image). Since convex polygons generate far fewer special cases, many algorithms are designed for convex polygons (often even only for triangles). Therefore, methods are also needed to divide concave polygons into several convex polygons (often into triangles).

## Viewing

### Viewing in the graphics pipeline

In principle, the scene to be displayed is modeled in world coordinates, whereby individual parts of their local coordinate systems are converted into world coordinates using geometric transformations (matrices!). After defining the camera parameters, these coordinates are converted into camera coordinates to which the projection is then applied. The result is stored in a normalized cube (often with a side length of 2), from where it is transformed into the device coordinates of the output medium used by the so-called viewport transformation.

[Figure: the viewing pipeline: Object Coord. → (Model Transformation) → World Coord. → (Camera Transformation) → Camera Coord. → (Projection Transformation) → Clip Space → (Viewport Transformation) → Device Coord.]

Several different projections are known in geometry, of which only the parallel projection and the perspective are of major importance in computer graphics. We will now first assume that the camera performs a parallel projection and then consider how the perspective projection can also be integrated into the pipeline. We'll start from the back because it's easier to think about this way.

### Viewport transformation

We therefore assume that the scene already exists in clip space, i.e. all relevant coordinates are located in an axis-parallel cube with side length 2 and center (0,0,0). We want to perform an orthographic mapping (parallel normal projection) with viewing direction -z onto a screen with dimensions nx × ny (pixels). All points (-1,-1,z) must therefore be mapped to (0,0) and all points (1,1,z) to (nx × ny). This linear mapping is achieved by the matrix Mvp:

```
[xscreen, yscreen, z, 1]^T = Mvp * [x, y, z, 1]^T

Mvp = [[nx/2, 0,    0, nx/2],
       [0,    ny/2, 0, ny/2],
       [0,    0,    1, 0   ],
       [0,    0,    0, 1   ]]
```

Their correctness can be proven immediately by inserting the corner points. However, the matrix has a special feature (the third row and third column, displayed in red in the script): the z-values are retained! This is not important at the moment but will be of great value in later steps (especially when calculating the visibility).

### Projection transformation

As already mentioned above, we assume for the moment that an orthographic projection is to be carried out. This simplifies the transformation enormously because now we only have to move and distort an axis-parallel cuboid with the boundaries L(eft), R(ight), B(ottom), T(op), N(ear), F(ar) so that the cube [-1,-1]³ is created (see figure). (L,B,F) must therefore become (-1,-1,-1) and (R,T,N) must become (1,1,1). Again, this can be easily expressed with a transformation matrix:

[Figure: the orthographic viewing volume in camera space, a box with corners (L,B,F) and (R,T,N), is mapped to the clip-space cube with corners (-1,-1,-1) and (1,1,1).]

```
Morth = [[2/(R−L), 0,       0,       −(R+L)/(R−L)],
         [0,       2/(T−B), 0,       −(T+B)/(T−B)],
         [0,       1,       2/(N−F), −(N+F)/(N−F)],
         [0,       0,       1,       1           ]]
```

[Note: the matrix is reproduced as printed in the script. The standard orthographic matrix has third row [0, 0, 2/(N−F), −(N+F)/(N−F)] and fourth row [0, 0, 0, 1].]

Note: A parallel projection can also be made at an angle to an image plane (for example when casting a shadow); this variant is not considered here.

### Camera transformation

As with photography, you have several degrees of freedom when setting the camera values:

1. Position of the camera in space
2. Viewing direction from this position
3. Orientation of the camera (where is the top?)
4. Size of the image section (corresponds to the focal length or zoom factor of a camera)

The camera coordinate system u,v,w (viewing coordinates) is calculated from the first three values. Normally, the uv plane of this viewing coordinate system is normal to the main viewing direction and you look in the direction of the negative w axis.

Starting from the camera position, the viewing coordinate system is defined as follows:

1. Selection of a camera position (also called eye point or viewing point).
2. Selection of a viewing direction, the negative viewing direction results in the w-axis.
3. Selection of a direction t "upwards"; the u and v axes can then be calculated from this.
4. Since the mapping plane is normal to the viewing direction, the vector product `t × w` gives the direction of the u-axis.
5. Calculation of the v-axis as the vector product of the w- and u-axes: `v = w × u`.

In animations, the camera definition is often calculated automatically from certain conditions, e.g. when the camera moves around an object or in a flight simulation, so that the desired effects can be achieved easily.

To convert the world coordinates into viewing coordinates, you need a chain of simple transformations: for example, a translation of the coordinate origins on top of each other and then 3 rotations so that the coordinate axes are also on top of each other (two rotations for the first axis, one for the second axis, and the third is then automatically correct).

[Figure: the u,v,w camera frame at origin e is first translated onto the world origin o, then rotated until u, v, w coincide with the x, y, z axes.]

These transformations can of course be summarized again by multiplication to form a matrix, which looks something like this: `M_WC,VC = Rz * Ry * Rx * T`

In order to fully describe the subsequent projection, the limits of the area to be displayed are required. The complete definition of the camera therefore also includes

6. The selection of minimum and maximum u, v, and w values to limit the section of the scene that is displayed: L(eft), R(ight), B(ottom), T(op), N(ear), F(ar).

In the parallel projection, L, R, B, T refer to the respective values of the boundary planes (u=L, u=R, v=B, v=T), in the perspective projection to the image boundaries in the near plane.

### Orthographic viewing

For the orthographic projection (camera images in parallel), we have now described all the steps using matrices. As with the geometric transformations, we can combine (multiply) these into a single matrix, which then performs the entire viewing transformation:

`[xscreen, yscreen, z, 1]^T = (Mvp * Morth * Mcam) * [x, y, z, 1]^T`

Note: the rightmost matrix is first multiplied by the point (x,y,z). If you apply the associative law, you can also multiply the 3 matrices with each other first, and can thus transform all points directly from world coordinates to device coordinates using only this one result matrix!

### Perspective

In perspective, several of the laws for affine transformations no longer apply (e.g. parallel lines are generally no longer parallel after a perspective projection), so it is not an affine transformation and cannot be generated by a 3x3 matrix. Fortunately, the homogeneous coordinates help here again, but this is the only case in which the homogeneous component h does not retain the value 1, and therefore a subsequent division step by this value is necessary.

First, let's consider a formula for the perspective transformation: We denote the projection center of the image by O, and the viewing direction is the negative z-direction. Then the mapping plane is normal to the z-axis at a distance N(ear). If a point (x,y,z) is mapped onto this plane, it has the coordinates (x*N/z, y*N/z, N). This can be achieved using a matrix P:

[Figure: side view with projection center O, image plane at distance N and a point at depth z; by similar triangles `yp = (N/z)·y` and `xp = (N/z)·x`.]

```
P = [[N, 0, 0,     0   ],
     [0, N, 0,     0   ],
     [0, 1, N + F, −F*N],
     [0, 0, 1,     0   ]]
```

[Note: reproduced as printed in the script; the result stated below corresponds to a third row of [0, 0, N + F, −F*N].]

If you multiply a point (x, y, z, 1) by P, you first get (x*N, y*N, z*(N + F) − F*N, z). By homogenizing (also normalizing = dividing by the last component, i.e. z) we obtain

`(x*N/z, y*N/z, (N + F) − F*N/z, 1)`.

This operation corresponds to a distortion of the scene area to be depicted (this truncated pyramid is called the "view frustum") into an axis-parallel cuboid in which the orthographic projection provides exactly the same image as the perspective projection in the view frustum. We can then apply the parallel projection we have already worked out and use it to calculate the perspective matrix Mper. Alternatively, you can simply insert P at the correct point in the overall view calculation and thus create an overall matrix that performs everything from model coordinates (x,y,z) to device coordinates (pixel positions (xscreen, yscreen)) in one step:

[Figure: the view frustum from O between the near plane N and far plane F (bounded by T and B) is distorted into an axis-parallel cuboid.]

`[xscreen, yscreen, z, 1]^T = Mvp * †(Morth * P * Mcam * Mmod) * [x, y, z, 1]^T`, where `Mper = Morth * P`.

If a perspective mapping is involved, the result must be divided by the homogeneous component (in this case z') at the end. In practice, at the point marked with †, i.e. in the clip space, not only the clipping is carried out, but also the homogenization. The viewport matrix is then applied separately as the last step.

Other important properties of the projection transformation are

1. Straight lines remain straight lines. To map such a line (e.g. the side of a polygon), it is sufficient to transform the two endpoints.
2. The relative order of the z-values (i.e. distance from the camera) is retained (but not the distance values themselves), which is important for the visibility calculation:

```
z1, z2, N, F < 0
z1 < z2
1/z1 > 1/z2                                       | * (−F*N)  (< 0)
−F*N/z1 < −F*N/z2                                 | + (N + F)
(N + F) − F*N/z1 < (N + F) − F*N/z2
```

Finally, it should be mentioned that the number of main alignment points depends on the position of the image plane in relation to the coordinate system. If two axes are parallel to the image plane, it is called one-point perspective, if only one axis is parallel to the image plane, it is called two-point perspective, and if all three axes are not parallel to the image plane, it is called three-point perspective (because there are then three main vanishing points).

[Figure: a cube drawn in single-point, two-point and three-point perspective, with its edges converging to one, two and three vanishing points respectively.]

## Clipping and Antialiasing

### Line Clipping

Clipping is the cutting off of parts of the image that lie outside the display window (see also illustration on the right). The earlier the clipping operation is carried out in the viewing pipeline, the more unnecessary subsequent reshaping of parts that are not visible anyway can be avoided:

- **Clipping in world coordinates** = analytical calculation at the earliest possible point in time,
- **Clipping in clip coordinates** = analytical calculation at axis-parallel boundaries (simple!),
- **Clipping in raster conversion** = within the algorithm that converts a graphic primitive into points.

[Figure: line segments P1–P10 against a rectangular window before and after clipping; lines fully outside disappear, lines crossing the border are shortened to new endpoints such as P'5, P'7, P'8.]

Clipping is a very common operation, so it must be simple and fast.

### Clipping of Lines: Cohen-Sutherland Method

Algorithms for clipping lines generally exploit the fact that each line in a rectangular window has at most one visible part. Furthermore, basic principles of efficiency must be utilized, such as eliminating frequent simple cases at an early stage and avoiding unnecessary expensive operations (intersection calculations). The simplest line clipping could look something like this:

```
for endpoints (x0,y0), (xend,yend)
intersect parametric representation
    x = x0 + u * (xend - x0)
    y = y0 + u * (yend - y0)
with window borders:
    intersection ⇔ 0 < u < 1
```

The Cohen-Sutherland algorithm first classifies the endpoints of a line according to their position in relation to the clipping window: top, bottom, left, right, and encodes this information in 4 bits. Now you can quickly check:

1. OR of the two codes = 0000 → Line completely visible
2. AND of the two codes ≠ 0000 → line completely invisible
3. otherwise intersect with a relevant window edge and replace the cut point with the intersection point. GOTO 1.

[Figure: the nine regions around the window with their 4-bit codes: top row 1001, 1000, 1010; middle row 0001, 0000 (window), 0010; bottom row 0101, 0100, 0110.]

Intersection point calculations:

- with vertical window edges: `y = y0 + m(xw_min − x0)`, `y = y0 + m(xw_max − x0)`
- with horizontal window edges: `x = x0 + (yw_min − y0)/m`, `x = x0 + (yw_max − y0)/m`

Points exactly on the edges of the window must of course be considered to be inside, in which case a maximum of 4 loop passes can be made. As you can also see, intersection calculations are only carried out when it is really necessary.

There are similar procedures for clipping circles. It must of course be taken into account that circles can break up into several parts when clipping.

### Polygon Clipping

The clipping of polygons must take into account that a polygon is created again after clipping, even if several parts are created by the clipping process. The illustration on the left shows a polygon that has been clipped using a line-clipping algorithm. It is no longer possible to tell what is inside and what is outside. The image on the right shows the result of a correct polygon clipping process. The polygon breaks down into several parts, all of which can be filled correctly.

#### Clipping of Triangles

In practice, geometric data very often consists only of triangles, and the rendering process no longer has any knowledge of their relationship. This is referred to as "triangle soup". In this case, it is important that there are no other primitives apart from triangles. Therefore, triangles must always be created when clipping. When clipping a triangle against an edge, a quadrilateral can also be created in one of four possible cases (see figure on the right). This must be immediately divided into two triangles to ensure further processing. It can happen that more triangles are created at the corners of the clip window than would be necessary (e.g. Fig. left), but this is more than compensated for by the simplicity of the algorithm.

#### Clipping in Clip Coordinates

In the clip space, the boundary surfaces of the view frustum (i.e. the area to be clipped) are all axis-parallel (x = ±1, y = ±1, z = ±1), which reduces the determination of whether a point lies inside or outside such a surface to a single comparison of two numbers. By performing this step before homogenizing the point coordinates by clipping at the planes x = ±h, y = ±h, z = ±h (which is just as easy), you ensure that points that lie behind the camera point are not projected (that would be completely wrong!), and it also saves the homogenization division for all points that were outside the clip area.

### Aliasing and Antialiasing

*Aliasing* effects ['eiliæsiŋ] are errors that occur during the conversion (discretization) of analog to digital information. Among other things, aliasing refers to all imperfections in raster images that occur because a pixel can only have one value but actually represents a small area. Visible aliasing effects have the following causes, for example: too low resolution, too few available colors, too few images/sec, geometric errors, and numerical errors.

*Antialiasing* is the name given to methods to reduce unwanted aliasing artifacts. As improving the hardware is usually unrealistic, software methods are mainly used. In the following, only anti-aliasing for dealing with the resolution problem will be discussed. Some known effects besides the staircase effect are the disappearance of small objects, interrupted narrow objects, different sizes of the same objects, complete destruction of fine textures (see figure).

#### Antialiasing of lines

The cause of aliasing is an insufficiently fine sampling of the true image. The theoretical basis for this is the *Nyquist-Shannon sampling theorem*. According to this theorem, information can only be correctly reconstructed if a sampling rate is used that is greater than twice as high as the highest information frequency to be transmitted. This limit is called *Nyquist-Limit*. The figure shows how a too-coarse sampling rate of a signal (curve) can lead to a completely incorrect reconstruction (polygon course). Such errors can be reduced either by pre-filtering the signal or by post-processing the finished image. However, post-processing is always inferior to pre-filtering. The central strategy for pre-filtering is *Supersampling* (also *Oversampling*).

[Figure: a low-frequency sine is reconstructed well from its samples, while a high-frequency sine sampled at the same rate yields a completely different, low-frequency polygon.]

Pixels that are crossed further by a line should be given more line color than pixels that are only lightly touched by a line. To do this, divide each pixel into sub-pixels, count how many sub-pixels lie on the line, and select an intensity that is proportional to this number. For wider lines, you calculate the percentage of overlap of the pixel by the line and then select the intensity of the line color. Based on the insight that the center of a pixel is more important than its edge, the subpixels in the center are sometimes weighted more heavily than those at the edge ("weighted oversampling").

[Figure: a 3×3 pixel block crossed by a line, showing per pixel the count of covered sub-pixels (0 0 1 / 0 2 2 / 3 1 0) and, for a wide line, the covered area percentage (0% 0% 43% / 15% 71% 84% / 90% 52% 3%).]

#### Antialiasing of Polygon Edges

There are the same alternatives for polygon edges as for lines: either you work with supersampling or you calculate the degree of coverage of the pixel by the polygon analytically. The degree of coverage is calculated at the same time as the raster conversion, i.e. the creation of the edge and the filling of a polygon. When calculating the endpoints of the spans in the scan line filling method, you have enough information available that the degree of coverage drops off almost free of charge.

We remember the decision variable p_k in the Bresenham line algorithm, the sign of which indicated which pixel was to be drawn next. This variable can be transformed so that its value corresponds to the degree of coverage of the last pixel. `p′ = y − y_mid`, where `y_mid = (y_k + y_{k+1})/2`, has the same sign property as p_k. If `p = p′ + (1 − m)` is used, the comparison is not made with 0 but with (1 − m), but `0 ≤ p ≤ 1` applies, and p corresponds to the degree of coverage at the point x_k. In this way, the anti-aliasing can be calculated incrementally very quickly. For other angles, you work with rotations of 90° and/or reflections of this method.

### Sampling and Reconstruction in Spatial and Frequency Domains

A sound understanding of sampling and reconstruction requires the consideration of a signal in spatial and frequency space. The Fourier transform describes a signal in spatial space (e.g. a scan line in an image) as the sum of sinusoidal oscillations in frequency space. A sinusoidal oscillation is described by frequency, phase, and amplitude. In frequency space, a signal is specified by a spectrum, with phase and amplitude depending on the frequencies ω. With the help of the Euler identity `e^(ix) = cos x + i·sin x`, phase and amplitude can be efficiently described by an imaginary number. The inverse Fourier transform converts a spectrum in frequency space into a signal in spatial space. A convolution combines two functions, resulting in the integrally weighted sum product of the two functions:

`(f1 * f2)(x) = ∫_R f1(τ) f2(x − τ) dτ`

The convolution theorem states that the multiplication of two functions in space corresponds to a convolution (*) of the corresponding spectra in frequency space (`f1·f2 = F1 * F2`) and vice versa (`f1 * f2 = F1·F2`). Sampling (i.e. discretization) in space is now a multiplication of the signal with a comb function comb_T. In frequency space, this corresponds to a convolution with the corresponding comb function comb_1/T. The tooth spacing in comb_T and comb_1/T are inversely proportional to each other. Convolution with the comb function results in a replication of the spectrum in frequency space (shadow spectra). If the sampling frequency is too low (below or at the Nyquist limit, T too large), the combs of comb_T are too far apart in the spatial domain and comb_1/T are too close together in the frequency domain. After sampling, the shadow spectra overlap, which causes aliasing. An error-free reconstruction is no longer possible. In the exact reconstruction, the shadow spectra created by the discretization are removed again. In frequency space, the spectrum of the discretized function is multiplied by a rectangular function, leaving only the original spectrum. This corresponds to the convolution with the `Sinc(x) = Sin(x)/x` function in local space. Since the sinc function is different from zero over an infinite range, the rectangular function (nearest-neighbor interpolation) or triangular function (linear interpolation) is used as a practicable reconstruction method.

[Figure 10: three diagrams contrasting spatial domain f(x) and frequency domain |F(u)|. (1) "Sampling at Nyquist frequency": sampling is multiplication with the comb function in the spatial domain; in the frequency domain this corresponds to a convolution with the related comb function comb_1/T; the convolution result is replicated frequency spectra (shadow spectra) that do not overlap. (2) "Sampling below Nyquist frequency": the teeth of comb_T are too far apart, the teeth of comb_1/T are too close together, the resulting shadow spectra overlap, which results in aliasing; an error-free reconstruction of the aliased discrete signal is not possible. (3) Reconstruction: eliminate the shadow spectra and retain the original spectrum by multiplication with a box filter; in the spatial domain this corresponds to a convolution with the sinc filter (ideal reconstruction); the original spectrum is recovered.]

Note: In the top left image, it would be more accurate to say 'Sampling at greater than Nyquist frequency,' since sampling at exactly the Nyquist frequency can still lead to errors (e.g., sampling a sine function at exactly the Nyquist frequency can result in a constant line if the zero crossings are always sampled).

## Visibility

In order to depict scenes credibly and correctly, all parts that are not visible from the viewing direction must be omitted. These are in particular the backs of objects and parts of objects that are covered by other objects. This is referred to as hidden line or hidden surface elimination.

Depending on the scene complexity, the object types and data structures, the available hardware and application requirements, different visibility algorithms are used. With the object space methods, the position of the objects is compared with each other and only the front (visible) parts are drawn; with the image space methods, the visible parts are calculated separately for each part of the image. The following explanations do not take transparent objects into account.

### Backface Detection (Backface Culling)

Backface culling is not a complete visibility determination algorithm. It merely eliminates all polygons whose surface normal points away from the viewer and which therefore definitely cannot be visible, in order to reduce the effort required for subsequent work steps. This removes on average 50% of the polygons. With orthographic projection, this is calculated using the scalar product of the viewing direction vector with the surface normal (`V_view · N > 0 → invisible`) or in the case of perspective projection by inserting the viewpoint (x, y, z) into the plane equation (`Ax + By + Cz + D < 0 → invisible`). [Assumptions as for "polygon lists"].

[Figure: a polyhedron with its face normals, viewed along the viewing direction; the faces whose normals point away from the viewer are marked "can be removed".]

### Z-Buffer-Method (Depth Buffer)

The z-buffer algorithm solves the visibility problem for a specific image resolution as follows: For each pixel, the position of the displayed object is remembered in separate memory in addition to its color information. Since the z direction is normally used as the viewing direction, the x and y values of this position correspond to those of the image plane and only the z value needs to be stored. Therefore, in addition to the frame buffer, additional memory is required to store a coordinate value (z-value) for each pixel; this memory is called the z-buffer or depth buffer.

All objects can now be drawn in any order. The z-values of the next object to be drawn (usually a polygon) are calculated and compared with the z-values of the pixels into which the object is to be drawn. If the new z-value is closer to the viewer (i.e. normally larger), the object is drawn at this point over the old image value and the z-value in the z-buffer is also replaced. Otherwise, the new object is hidden and is not drawn at this point:

```
for all (x,y)                                  // Initializing the background
    depthBuff(x,y) = - 1                       // greatest possible distance
    frameBuff(x,y) = backgroundColor
for each polygon P                             // Loop over all polygons
    for each position (x,y) on polygon P
        calculate depth z
        if z > depthBuff(x,y) then
            depthBuff(x,y) = z
            frameBuff(x,y) = surfColor(x,y)    // else nothing !
```

For flat polygons, the z-values can of course be calculated incrementally more efficiently. The great advantage of the z-buffer method is that the objects (polygons) do not need to be sorted.

(Note: In the viewport transformation, z is often multiplied by -1 before the z-buffer method is applied).

### Scanline Method

With the scanline method, the correct visibility is calculated line by line (in the example from top to bottom, i.e. y decreasing). This takes advantage of the fact that two rows of pixels (scanlines) lying on top of each other often differ only insignificantly in their visibility behavior.

### Depth Sorting Method

The basic principle of the depth sorting method is to sort all polygons from back to front and then draw them in this order. As all hidden parts are further back than the parts that hide them, an image with correct visibility remains at the end (painter's algorithm). Here, the main effort lies in sorting, which must be done in such a way that no polygon (partially) obscures another polygon that comes later in the list (i.e. is further "in front"). To do this, a rough sort is first carried out quickly and then checked to see if everything is correct and re-sorted if necessary.

### Area Subdivision Method

Similar to the quadtree representation of images, simple cases are solved at a coarser resolution and more complicated cases are simplified by dividing the area into four quarters. Recursive application up to the maximum image resolution guarantees a pixel-precise solution to the visibility problem.

### Octree Method

If the scene is represented as an octree instead of polygons, the data structure already knows what is in front and what is behind for each viewing direction. Recursively, you can always render the most distant subcube in each cube first, then the 3 closest ones, then the next three, and finally the foremost one. A possible sequence for a frontal viewing direction can be seen in the following example:

[Figure: seven stages of drawing an octree cube, starting with the rearmost subcube, then adding the next three, the next three, and the frontmost subcube, with subdivided subcubes drawn recursively in the same order.]

Alternatively, you can also draw from front to back. Then you have to remember all the areas in which something has already been drawn and only draw things that actually remain visible. The advantage over other data structures remains the implicit knowledge of what is further forward or further back.

### Ray Casting

Ray casting is a visibility algorithm that calculates what is visible for each pixel separately. To do so, a ray is cast from a particular pixel in the direction of view, i.e. a straight line through the pixel into the scene. In the opposite direction, the light from the scene travels along this line to the image plane, i.e. to the viewer. If you intersect this ray of light with all the objects/polygons in the scene, you will obtain a number of intersection points from which you can select the one closest to the viewer. The color of the surface at this point determines the color of the pixel through which you have placed the ray. If you do this for all pixels, you get the color of the foremost object, i.e. the visible object, for each point.

In addition to polygons, ray-casting can also be used to easily render all other surfaces (e.g. free-form surfaces) for which the intersection with a straight line can be calculated. As we will see later, you normally also need the surface normal at the point of impact in order to obtain usable shading. However, this is very time-consuming, since for each pixel (that's several million for a screen) you have to perform an intersection with each object (and that can be thousands to millions of objects). Efficient implementation of the intersection test and further optimizations are therefore necessary.

#### Ray Casting of CSG Objects

The most common method for mapping CSG objects is ray casting, in which the image is calculated pixel by pixel. For each pixel, a ray is cast in the viewing direction and intersected with all objects in the scene. The foremost of these intersection points indicates which object can be seen in this pixel, and the pixel receives its color. In a CSG tree, this calculation is performed recursively:

[Figure: a ray from the pixel plane passes through two overlapping objects obj1 and obj2; along the ray the intersection points are, in order, A (entering obj1), C (entering obj2), B (leaving obj1) and D (leaving obj2).]

- for end nodes, the calculation of all intersection points is simple,
- for intermediate nodes, the intersection point lists of the two successors are linked according to the operator:
  - for union the list (A,D)
  - for average [i.e. intersection] the list (C,B)
  - for difference the list (A,C)
- for the tree root, the first point of the linked intersection list is selected

Ray casting is a simplified version of ray tracing that can be used to simulate many more optical effects. This will be discussed in a subsequent chapter.

**Ray-Casting** = for each pixel of the display area:

- create a straight line through a pixel in the viewing direction ("ray of vision")
- intersect the line of sight with all objects
- select the point closest to the viewer from the intersection point list
- color the pixel with the color of the surface of this point

### Classification of Visibility Algorithms

Which methods work in object space and which in image space? This cannot always be clearly classified, but by and large the following applies:

- **Object space processes:** Backface Detection, Depth Sorting, Octree Method
- **Image space processes:** Z-buffer, Scanline Method, Area Subdivision, Ray Casting

## Lighting and Shading

An illumination model (lighting model or shading model) is used to calculate which color/brightness the viewer perceives based on the description of the lighting conditions and the surface properties of an object, i.e. which color the corresponding pixel should receive. In addition to perspective projection, the illumination model is the most important contribution to the realistic appearance of computer graphics images.

For the sake of simplicity, all the following considerations and formulas refer only to the brightness of the lighting. To handle colors, these calculations must be performed in several wavelengths, i.e., in the simplest case, red, green and blue.

### Light Sources and Surfaces

#### Light Sources

To be able to calculate the influence of lighting, you first need light sources. Characteristics of light sources can be:

- Shape: Light direction, point light sources, directional point light sources, planar light sources, ...
- Properties: Brightness, color, distance, ...

[Figure: a sun emitting parallel rays (light direction), a bulb radiating in all directions (point light), a desk lamp with a cone of light (directional point light) and a window-like panel emitting rays (planar light source).]

#### Object Surfaces

Surfaces can either reflect the incident light diffusely, i.e. the same amount of light is reflected in each direction (e.g. paper, chalk), reflect it specularly, i.e. more light is reflected in the direction of reflection than in the other directions (e.g. paint, metal), or be transparent, i.e. the light passes through the surface and comes out on the other side (e.g. glass, water). Real surfaces usually have a mixture of these properties. Furthermore, it should noted that light does not only hit surfaces from the light sources directly. Light reflected from other surfaces also plays a role.

[Figure: diffuse reflection (reflected light spread evenly in a semicircle), specular reflection (reflected light concentrated in a lobe around the reflection direction) and transparency (light lobe passing through the surface).]

### A Simple Lighting Model

The physically exact simulation of light and its interaction with object surfaces is very complex. Simplified, empirical lighting models are therefore used in practice. These are structured something like this.

#### Background Light (Ambient Light)

As every object also emits some of the light that hits it, it is not completely dark even in places where no light source shines directly. This basic, omnipresent light is called *ambient* light, also known as background light. Simple lighting models include a constant value Ia in every lighting calculation.

[Figure: a sphere lit only by ambient light appears as a flat, uniformly colored disk.]

#### Lambert's Law

This law states that the flatter the light falls on a surface, the darker this surface appears. It is this effect that gives us the impression of a spatial form.

Let I be the brightness of the relevant light source, and let kd be the diffuse reflection coefficient of the illuminated surface, i.e. the percentage of incident light that is re-radiated uniformly in all directions. Of course, `0 ≤ kd ≤ 1` applies. Furthermore, let θ be the angle between the surface normal and the direction to the light source, i.e. the direction of light incidence. Then the resulting pixel color L at this surface location applies:

`L = kd * I * cos θ = kd * Il * n · l`   [n · l is the scalar (dot) product]

[Figure: surface normal n, light direction l at angle θ to n; n · l is the projection length of l onto n.]

If you now also add ambient light, you get a really nicely illuminated sphere (left sphere = diffuse lighting only, right sphere = diffuse + ambient).

#### Specular Highlights

Almost every surface is also somewhat reflective. If this aspect is not modeled, then all materials appear equally dull. As the exact specular reflection is extremely complicated to calculate, a simple function is used that has a similar curve to the highlight: `cos^p`. The free parameter p can be used to control the "polish" of the surface: the larger p is, the smaller the highlight and the smoother the surface appears (left sphere), the smaller the p is, the duller the surface appears (right sphere). In order to be able to add this effect to the lighting to the correct extent, a further factor is introduced, the specular reflection coefficient ks.

The surface's gloss is then calculated according to this so-called Phong illumination model: `Ispec = ks * I * cos^p σ = ks * I * (r · v)^p`. The angle σ is the difference between the exact reflection ray r and the direction to the eye v.

[Figure: light direction l and reflection ray r make equal angles θ with the normal n; the view direction v deviates from r by the angle σ.]

To describe lighting more accurately, Fresnel's laws of reflection models the degree of reflection also on the angle of incidence of the light, i.e. coefficient ks is actually a function W(Θ) of the direction of incidence of the light. For most materials, however, this value is almost constant. Therefore, this tends to be ignored unless you do want to represent a material where the effect is noticeable. The image on the right shows the dependence of this function W(Θ) on the angle between the incidence of light and the normal to the surface for three different materials.

[Figure: plot of W(Θ) for Θ from 0 to 90°: silver stays near 1, gold starts around 0.5, dielectric (glass) stays near 0; all curves rise steeply to 1 as Θ approaches 90°.]

When calculating r, it must be remembered that we are dealing with vectors in 3D space, where l, n and r must lie in a plane and all have length one. r results in `r = (2n · l)n − l`. Since the specular highlight function is only a rough approximation anyway, a simpler formula is often used in which `r · v` is replaced by `n · h`. The angle between n and the bisector h between l and v is very similar to σ. The resulting model is called the Blinn-Phong illumination model.

If we put all the previous components together, we get a simple complete lighting model:

`L = ka * Ia + Σ_{i=1,...,N} ( kd * Ii * (n · l) + ks * Ii * (n · hi)^p )`

There are many other aspects that need to be considered in order to get closer to reality, but these are not described in detail here: Color shifts depending on the viewing direction, influence of the distance of the light source, anisotropic surfaces and light sources, transparency, atmospheric effects, shadows, and so on.

### Shading of Polygons

#### Flat Shading

When shading a polygon, each point clearly has the same surface properties, especially the same normal vector. When simply filling each polygon with a color, the boundaries between the polygons become clearly visible. The so-called Mach band effect, which is an edge-enhancing mechanism of the eye, makes the problem even worse than it is. This effect makes us perceive the darker side of edges as darker than it is, and the lighter side as lighter than it is. The simplest solution to this problem is to interpolate the shading between the polygons. Two methods are commonly used for this: Gouraud shading and Phong shading.

#### Gouraud Shading

Gouraud shading interpolates the calculated brightness values over the polygon areas. To do this, brightness values are calculated at the corner points of the polygons and each polygon is filled from these using linear interpolation. Specifically, it works like this:

1. A normal is calculated at each corner point as the mean value of the normals of all adjacent polygons. Of course, this is only an approximation of the normal of the real underlying surface.
2. A brightness value ("shading") is calculated for each corner point from the properties of the surface, the normal, and the direction of light incidence. Note that adjacent polygons at these corner points all receive the same values.
3. The brightness values are interpolated linearly along the polygon edges, i.e. a value is determined for each intersection with a scanline. Note that this results in the same values for adjacent polygons along the common edge.
4. Linear interpolation is performed again along each scanline from the left to the right polygon boundary. As a result, adjacent pixels always have a very similar brightness and there are no visible edges.

Nevertheless, sources of error remain. For example, the silhouette is of course not changed, which means that bothersome polygon edges remain visible (see image below).

Furthermore, random interpolations occur in the area of specular highlights, depending on whether there happens to be a normal that generates exactly one highlight or not. This is particularly annoying with moving objects.

Simple linear interpolation to calculate a pixel value Lp:

[Figure: triangle with vertices 1 (left), 3 (top right), 2 (bottom); a scan line crosses edge 1-2 at point 4 and edge 3-2 at point 5, with pixel p between 4 and 5.]

`L4 = (y4 − y2)/(y1 − y2) * L1 + (y1 − y4)/(y1 − y2) * L2`

`Lp = (x5 − xp)/(x5 − x4) * L4 + (xp − x4)/(x5 − x4) * L5`

The *linear (!) interpolation of the intensities* can of course be done incrementally again, e.g.:

[Figure: edge from I1 to I2 crossed by scan lines y and y−1, giving intensity I on scan line y and I′ on scan line y−1.]

`L = (y − y2)/(y1 − y2) * L1 + (y1 − y)/(y1 − y2) * L2`

`L′ = L + (L2 − L1)/(y1 − y2)`

#### Phong Shading

As an alternative to Gouraud shading, Phong shading (not to be confused with the Phong lighting model!) produces much more consistent gloss effects. As with Gouraud shading, the normals are calculated at the polygon corner points, but now these normals are interpolated along the polygon edges (no brightnesses have been calculated yet!), and then along the scanlines. The brightness is then calculated separately for each pixel according to an illumination model. Although this requires more effort, it also leads to better results.

Normal vector interpolation:

[Figure: edge with vertex normals n1 (top) and n2 (bottom); at scan line y the interpolated normal n is obtained.]

`n = (y − y2)/(y1 − y2) * n1 + (y1 − y)/(y1 − y2) * n2`

**PLEASE NOTE:** The phong illumination model (also phong shading model) and phong shading (also phong interpolation) are two completely independent things!

## Ray Tracing

Ray tracing is the "tracing of ray tracks", whereby light rays are traversed in reverse. It is a very powerful method that can be used to simulate a number of important optical effects in addition to correct visibility: Shading, shadows, mirror images, and refraction. The simplicity of the method allows even very complex objects to be represented in this way, such as free-form surfaces, fractal surfaces, mathematical functions of all kinds, etc.

### The Ray Tracing Principle

The basic principle is to follow the light that hits a pixel in reverse to examine where it comes from in order to draw conclusions about the appearance of the pixel.

#### Correct Visibility and Shading

As with ray casting, a *view ray*, the so-called "primary ray", is placed through each pixel and intersected with *all* surfaces in the scene. From the resulting intersection points, select the one that is closest to the image and select the shading of this object point (as viewed from the viewing direction) as the value for said image point. When done for all image points (in the simplest case for all pixels), you will obtain an image of the scene with the correct visibility. Note that any shading model can be used, e.g. the Phong model.

#### Shading

To calculate the shading of a point, you need the directions to all light sources in addition to the surface normal. However, a light source only has a direct influence on the shading of a point if the incidence of light is not obscured by other objects, i.e. if there are no objects between the point and the light source. To determine this, place a *shadow sensor* (the so-called "secondary ray") from the point to be shaded to the position of the light source. Intersect this straight line with *all* objects in the scene and do not take the light source into account when obtaining an intersection between the object and the light source. This way, all object parts that lie in the shadow of an obscuring object (in relation to the light source) receive less light than object parts that are visible from the light source without obstruction. A shadow is therefore automatically cast by the objects lying in between.

[Figure: a ray cast from the eye through each pixel of the image plane hits an object (correct visibility); from the hit point, rays go to the light sources (shading, one blocked by another object = shadow), in the reflection direction (reflection) and through the object (transparency).]

#### Mirror Images

If the ray of vision hits an object that is a mirror, you do not see this object itself, but the object that is visible from the point of impact in the direction of reflection. Since the law of reflection (angle of incidence is equal to the angle of reflection) is symmetrical, this mirrored object can be found by reflecting the gaze ray on the surface and following a *reflection ray* (also referred to a "secondary ray") in the direction of reflection, intersecting with *all* objects again and selecting the first point of intersection. The shading of this further point of intersection (viewed from the direction of incidence of the reflection ray) is then what the original ray of vision sees. Note that the reflection behavior is calculated locally, meaning that curved mirrors can be created without additional effort.

#### Transparency

It is now also no problem to handle transparent objects. If the first point of impact of a ray of light is on a transparent object, you can see what the *transparency ray* (also a "secondary ray") passing through the transparent object hits. Using the law of refraction, it is easy to set the direction of the transparency beam such that the transparent material refracts the light. The transparency beam is also intersected with *all* objects and the initial point of intersection is selected. The shading of this point of intersection (viewed from the direction of incidence of the transparency beam) is then what the original ray of vision sees.

#### Recursion

Every ray except a shadow sensor, i.e. every straight line that represents an inverted beam of light is basically equivalent. This means that if such a beam hits a surface, it is irrelevant for the action at this point whether it is a primary or secondary beam. In this way, even multiple reflections and reflections behind transparent material, etc. are just as easily possible.

#### Perspective

The way in which the primary rays of vision are generated determines how the scene is mapped onto the image plane. If you use parallel rays that are normal to the image plane, you get an orthonormal parallel projection of the objects. If all rays of vision originate from a fictitious eye point, the image is generated from that perspective. Note that the perspective is created naturally without any additional effort (if you disregard optimization methods that exploit the parallelism of the rays).

[Figure: perspective: all rays begin at some point of view (the eye) and pass through the pixels of the image plane.]

### Ray-Tracing Implementation

Writing a ray tracer is quite simple. You need a function that intersects a straight line with all objects and returns the foremost intersection point.

Ray-Tracing Pseudocode:

```
FOR all pixels p0 DO
  1. project ray of vision from eye e through p0,
     intersect said ray with all objects and select the closest point of intersection p
  2. FOR all light sources s DO
        intersect shadow sensor p -> s with all objects
        IF no intersection between p, s THEN shading += influence of s
  3. IF surface of p is reflective
     THEN track secondary beam; shading += influence of reflection
  4. IF surface of p is transparent
     THEN track secondary ray; shading += influence of transparency
```

The viewing coordinate system is normally set up so that the xy plane is the image plane and the main viewing direction coincides with the negative z axis. Rays are used in a parameterized form: Starting point p0 plus parameter t times direction vector d: `p(t) = p0 + t · d`.

- *Primary rays* are therefore **eyepoint** `e + t · (pixel p0 − eyepoint e)`,
- *Shadow sensors* are **surfacepoints** `p + t · (lightsourceposition s − p)`,
- *Reflection rays* are `p + t · r`, where `r = (2n · v)n − v` is the direction of reflection of the ray v, which results from the law of reflection (angle of incidence = angle of reflection). This calculation also guarantees that r has a length of 1. (see sketch on the right)
- *Transparency rays* are `p + t · t`, where t results from Snellius' law of refraction `sin θ1 : sin θ2 = η2 : η1` (ηi is the refractive index of the material i):

  `t = −(η1/η2) v − (cos θ2 − (η1/η2) cos θ1) n`

  The vector t also has the length 1 (see left sketch).

[Figure: reflection sketch: view vector v and reflection vector r symmetric about the normal n, with n·v the projection of v onto n. Refraction sketch: v arrives at angle θ1 to the normal n, the transmitted vector t leaves at angle θ2 on the other side of the surface.]

If the light rays are now "tracked" in reverse in this way, a recursive call sequence is created (see sketch below), which corresponds to a ray tree (right-hand sketch). Normally, however, this tree is not saved in this form but is only a symbolic representation of the recursion call sequence.

[Figure: a primary ray P hits a green prism, its reflection R1 hits a sphere, which spawns a reflection R2 (hitting a cyan crystal, which spawns R3 and T2) and a transparency ray T1 (hitting a magenta object); the ray tree shows P at the root with children R1, then R2 and T1, then R3 and T2, and so on.]

### Intersections between Beams and Objects

Objects that are to be displayed with ray tracing must fulfill a few conditions:

- it must be possible to calculate the intersection point with a straight line,
- the surface normal must be known at this point
- material properties must be available (at this point).

This is of course easy for BReps, but also for CSG trees that are evaluated recursively. However, many other data formats also meet these conditions (e.g. free-form surfaces). Functions that calculate the intersection with a ray must therefore be provided for each primitive type. As an example, this is described in more detail for a sphere and a polygon.

#### Beam-Ball Section

Spherical equation: `|p − c|^2 − R^2 = 0`

The ray is inserted into this: `|(e + td) − c|^2 − R^2 = 0`

Then Δp is introduced for better readability: `Δp = c − e`

And you get a quadratic equation in t: `t^2 − 2(d · Δp)t + (|Δp|^2 − R^2) = 0`  (with `d^2 = 1`)

The 2 solutions correspond to the two intersection points with the sphere: `t = d · Δp ± sqrt((d · Δp)^2 − |Δp|^2 + R^2)`.

[Figure: ray from eye point e with direction d hitting a sphere with center c and radius R at point p.]

In cases where `R^2 << |Δp|^2` (which is quite common), rounding errors occur in this formula. To avoid these, you can use `d^2 = 1` and transform the formula so that rounding errors become less likely:

`t = d · Δp ± sqrt(R^2 − |Δp − (d · Δp)d|^2)`

#### Beam-Polygon Intersection

When intersecting a ray with a polygon, one first tests whether the polygon is even looking in the right direction (see Backface Detection). The ray `p = p0 + t · d` is then inserted into the plane equation `Ax + By + Cz + D = 0` of the polygon, which, since `n = (A, B, C)`, can also be written in the form `n · p = −D`: `n · (p0 + t · d) = −D`. This results in `t = −(D + n · p0)/(n · d)`, which, when inserted into the beam equation, gives the intersection point with the plane.

Now you need to check whether the intersection point is inside the polygon edges or next to the polygon (see illustration on the right). This can be done after projection onto a main plane in 2D.

[Figure: two rays hitting a polygon plane: one intersection point lies inside the polygon, the other lies in the plane outside the polygon.]

### Ray-Tracing Acceleration

Ray tracing is an extremely complex process. Mapping a scene with only 1000 polygons or objects onto an area of 1000×1000 pixels requires 10^9 intersection calculations for the primary rays alone without optimizations. It is therefore necessary to speed up the process significantly. The most important method for this is to reduce the number of necessary intersection calculations by utilizing coherence.

#### Object Environments

Before cutting all the individual parts of a more complex object (or part of a scene) with a beam, you can check whether the beam even comes close to this object. For this purpose, *environmental spheres* (bounding spheres) are inserted in the data structure for such complex objects, which completely enclose the object. Rays that do not hit this bounding sphere will certainly not hit the object, and many unnecessary intersection calculations are saved. The concept can be applied hierarchically, i.e. complex partial objects all receive surrounding spheres, their parts again, etc., until simple objects are reached. In this way, the actual intersection attempts are reduced from O(n) to about O(log n). Instead of environment spheres, you can use any other object environment, e.g. environment cuboids. It is important to weigh whether the additional effort due to their more complicated shape justifies the gain due to their narrower concern.

[Figure: a group of objects enclosed by one large environment sphere (level 1), with nested hierarchical environment spheres around sub-objects (levels 2 and 3).]

#### Space Division Methods

Alternatively, you can also divide the entire room in which the scene is located into a regular grid, regardless of the objects. It does not matter whether you save the subcubes in an array or use an octree. You then only need to intersect the objects with the beam that lie in the subspaces through which the beam passes. You therefore need to quickly calculate which is the next subcube on the beam path. Once you have found an intersection point in a subcube, you can stop! Algorithms similar to a 3D Bresenham method can be used for this.

[Figure: a ray from e with direction d passing through a regular grid of subcubes; only the subcubes along the ray path are visited.]

You can also proceed as follows for individual subcubes:

The ray `p(t) = p0 + t · d` enters the subcube at p_in. The normal vectors of the cube faces are

`(1, 0, 0), (−1, 0, 0), (0, 1, 0), (0, −1, 0), (0, 0, 1), (0, 0, −1)`.

For the three surfaces with `d · n > 0` (the others are out of the question!), determine the point of intersection with the ray and select the foremost point (smallest t). This method also works if the cubes are of different sizes (e.g. in an octree).

```
p_out,k = p_in + t_k * d
n_k · p_out,k = −D_k
t_k = (−D_k − n_k · p_in) / (n_k · d)
```

## Global Illumination and Textures

### Radiosity

The *Radiosity* method originated in thermodynamics and models the propagation of light in a closed system, taking into account the energy equilibrium. The method describes the physical process of the propagation of light in a diffusely reflective environment, i.e. the calculation of the brightness of all surfaces in a scene, taking into account their mutual influence. This means that even surfaces that are not directly illuminated are given a certain brightness. Each illuminated object acts as a secondary light source. For image generation Bi, the light propagation in space is first calculated without knowing the camera position, whereby it is assumed for simplicity's sake that the observer does not influence the propagation of the light. The objects can then be displayed from different directions without having to recalculate the light propagation each time.

[Figure: light from a lamp bounces between a wall, the floor and a table, so that surfaces not directly lit also receive light.]

### The Radiosity Equation

The scene consists of n plane polygons Pi, which are referred to as *patches* in the radiosity method. To simplify matters, it is assumed that each patch has a homogeneous, perfectly diffuse surface. Light sources are also patches that emit their generated light evenly in all directions. The ***radiosity*** Bi of Pi is the total radiated energy, i.e. the sum of self-radiation and reflection as power per unit area. This light energy density is proportional to the perceived brightness. As a next simplification, it is assumed that the radiosity has the same value for all positions on a patch. Under these conditions, the formula for the radiosity of a patch looks like this:

`Bi = Ei + ρi · Σ_{j=1}^{n} Bj · Fij`

Here Ei is the intrinsic emission of Pi, ρi is the diffuse reflection coefficient of the surface (that indicates how many % of the incident light is diffusely reflected, also called *albedo*), n is the number of patches of the scene, Bj are the radiosities of all other patches, and Fij are the so-called *form factors*, which indicate what proportion of the radiosity acting on Pi comes from Pj (this is the same as the proportion of radiosity from Pi that hits Pj). Fij are purely geometric quantities and independent of light sources or radiosity values, and can therefore be calculated before the radiosity is determined. The radiosity formulas for n patches result in a linear system of n equations in n unknowns Bi:

`Bi − ρi Σ_{j≠i} Bj Fij = Ei`

```
[[ 1,        −ρ1 F12,  ...,  −ρ1 F1n ],       [ B1 ]     [ E1 ]
 [ −ρ2 F21,  1,        ...,  −ρ2 F2n ],   ·   [ B2 ]  =  [ E2 ]
 [ ...,      ...,      ...,  ...     ],       [ ...]     [ ...]
 [ −ρn Fn1,  −ρn Fn2,  ...,  1       ]]       [ Bn ]     [ En ]
```

This system of equations can only be solved iteratively.

### Calculation of Form Factors

In order to derive a formula for the form factors Fij, we need a simple geometric relationship: The area of the normal projection of a surface A onto another surface is reduced by the cosine of the angle between the surfaces, i.e. `A · cos θ`.

[Figure: a segment a tilted by angle θ projects onto a line with length a·cosθ; likewise a tilted surface A projects onto a plane with area A·cosθ.]

The *shape factor* Fij is now defined as the proportion of the radiant energy emitted by the patch Pi that hits the patch Pj. In other words, what percentage of the energy from patch Pi hits patch Pj. It is easy to imagine that this value also tells you what percentage of the incoming energy on patch Pi comes from patch Pj.

Fij can now be calculated as follows: Let us assume that the size of the patches is small in relation to their distance r. Let Aj be the area of Pj. Above the patch Pi we imagine a hemisphere with a radius of 1, onto which the patch Pj is projected.

The resulting area A′j then has approximately the size `Aj cos ϕj`, where ϕj is the angle between the patch normal and the connection between the two patches. If you now consider that energy incident on patch Pi at an angle is proportional to the cosine of the angle of incidence, you must multiply this value by cos ϕi (this corresponds to a projection onto the bottom surface of the hemisphere) in order to obtain the correct proportion of the influence of patch Pj. Since the sum of all shape factors Fij for a patch Pi must, of course, be 1 (100%), we normalize the result by the size of the base area of the hemisphere, i.e. by `1^2 π = π`, and obtain the form factor:

`Fij = (cos ϕi cos ϕj Aj) / (π r^2)`

[Figure: patch Pj (area Aj) at distance r from patch Pi, projected onto a unit hemisphere over Pi (area A′j); ϕi and ϕj are the angles between each patch normal and the connecting line r.]

This formula applies under the condition that there are no obstacles between the two patches, i.e. that the light can pass unhindered from Pi to Pj. Correct form factors must therefore also take mutual visibility into account.

The *reciprocity principle* also applies to the form factors, which relates the dependence of the form factors between two patches to each other: **`Ai · Fij = Aj · Fji`**.

In practice, a half cube ("hemicube") is used to estimate the form factors instead of a hemisphere over Pi, and the entire scene is mapped onto this. This can be done using *z*-buffer technology, i.e. the surface of the hemicube is regularly divided into pixels and all other patches are mapped onto these with the center of the cube as the projection center. For each pixel, its shape factor is determined in advance and then these proportions are added together for each patch to form its shape factor. Alternatively, shape factors can also be calculated using ray tracing methods.

[Figure: patch Pj projected onto a hemisphere over Pi (left) and onto a hemicube over Pi whose faces are divided into pixel cells (right).]

### Progressive Refinement

To solve the system of equations iteratively, select the brightest patch and distribute its energy to all the others ("shooting"). This makes all patches slightly better in one step. And because the energy of the brightest patch is always distributed next, the method converges very quickly.

[Figure: patch Pi "shooting" its radiosity Bi in all directions over a hemisphere.]

Let B(i from Bj) be the radiosity component of Pi caused by Bj. The influence of Pi on Bj is symmetrical to the influence of Pj on Bi:

`B(i from Bj) = ρi Bj Fij`, thus `B(j from Bi) = ρj Bi Fji`.

From this and from `Ai · Fij = Aj · Fji` follows **`B(j from Bi) = ρj Bi Fij (Ai/Aj)`**, so the form factor Fij can be used. For each patch, in addition to the radiosity Bj collected so far (i.e. the best estimate so far), the "not yet shot radiosity" ΔBj is also saved, which is the basis for selecting the next "brightest" patch. At the beginning, the Bj and the ΔBj are of course initialized with Ej: `Bj = ΔBj = Ej` for all j.

Simplified, an iteration step therefore looks like this:

```
select patch i with highest Ai * ΔBi

FOR selected patch i {  set up hemicube
                        calculate form factors Fij }

FOR each patch j {  Δrad := ρj * ΔBi * Fij * Ai/Aj
                    ΔBj  := ΔBj + Δrad
                    Bj   := Bj + Δrad }

ΔBi := 0
```

This process is also known as progressive refinement.

[Figure 21: Three examples of radiosity images (© Lischinski; Hrbek; Feldman & Wallace): an interior room with a table and chairs, a vaulted colonnade, and an industrial hall, all showing soft indirect lighting.]

### Aspects of Radiosity

Radiosity is a *viewpoint-independent* method for calculating the brightness of the individual (diffuse) patches, after which a rendering step is still necessary. A simple polygon method with Gouraud shading is usually used. However, in order to achieve the effects possible with ray tracing in the finished image, the diffuse shading values obtained in this way can also be used as base values for ray tracing. This also allows reflections and shadows etc. to be displayed beautifully.

The basic principle of radiosity presented here can be extended in many ways. To reduce the number of patches, they can be structured hierarchically so that more distant patches do not have to be treated individually. In order not to generate false smearing of the lighting due to too coarse patches in places where the lighting changes abruptly (e.g. shadow edges), and conversely not to make the patches too small in these places, *Discontinuity-Meshing* is used.

### Path Tracing

*Path tracing* is actually an extension of ray tracing (also called "Monte Carlo ray tracing"), in which secondary rays are not placed in all relevant directions at each point of impact, but only one direction is randomly selected according to the distribution function valid there. This makes it possible to include situations where many different directions of light are relevant, such as diffuse reflection and extended light sources. Of course, many rays must now be calculated and averaged per pixel in order to avoid excessive noise in the resulting image. In principle, this procedure corresponds to the Monte Carlo integration of a multidimensional integral that describes the propagation of light in space ("rendering equation"). The use of quasi-random numbers instead of pseudo-random numbers significantly reduces the variance.

[Figure: a primary ray P hits a diffuse prism; from the reflection lobe one direction R1 is chosen at random, it hits a sphere, from whose lobe one direction R2 is chosen, which continues through a transparent object as T1, and so on.]

### Photon Mapping

With the *photon mapping method*, light rays are traced from the light sources, i.e. similar to ray tracing, but in the forward direction. The effect of the light is stored at points of impact and the appearance of the object is later interpolated between these values. This makes it possible to correctly calculate the effect of light sources even in complicated situations (e.g. reflections of the light source(s) or caustics). A combination of path tracing and photon mapping can integrate almost all light effects into an image.

[Figure 22: Examples for global illumination results: left: Radiosity + Ray-Tracing (see reflections), an office room; right: Path-Tracing + Photon-Mapping, an open-plan office (© Feda; VRVis).]

An essential optical property of natural surfaces is that they exhibit various irregularities. This can be caused either by the environment, by a variable coloration of the surface, or by the shading caused by surface irregularities. For these three causes, the effects can be simulated using the three methods *Environment Mapping*, *Texture Mapping* and *Bump Mapping*. Mapping means *Mapping*.

### Environment Mapping

Environment refers to the surroundings, the environment of an object. Depending on the surface properties of the object, the environment will have a different effect on the appearance of the object. For perfectly reflective surfaces, ray tracing can be used to create the exact mirror image of the environment. For imperfectly diffuse surfaces, the Phong model can be used to approximate gloss effects in the surroundings of the reflection of light sources. However, a more or less reflective surface reflects its entire surroundings more or less sharply, whereby the accuracy is greatly reduced. In order to efficiently render objects in a complex environment without having to completely model the entire environment and without claiming exactness, *Environment Mapping* is used. In a pre-processing step, the environment is produced as an image from a central point (e.g. the center of the object or the scene to be displayed).

Whether this is a calculated or a photographed image is irrelevant. In any case, it is assumed that the environment (e.g. sphere or cube) is large in relation to the objects that are to be displayed. Now, when representing an object, it is approximately assumed for each surface point that it lies in the center of this environment. This allows you to quickly determine *only from the direction* of the reflection ray which point of the environment is hit (e.g. with polar coordinates) and saves time-consuming ray tracing.

Axis-parallel cubes are often used as environment maps, these are called *Cube-Map*. If each side contains an image of size `u×v = [0, 1]×[0, 1]`, the image value can be determined efficiently for the direction vector of the reflection ray `r = (xr, yr, zr)`, e.g. for the side x > 0 by `u = (yr + xr)/2xr` and `v = (zr + xr)/2xr`. The reflection direction r is again obtained according to the same principle as already derived for ray tracing and shading methods: **`r = (2n · v)n − v`**, where **v** is the vector to the observer and **n** is the surface normal.

[Figure: a cube with coordinate axes x, y, z at its center; each face carries an image with (u, v) coordinates from (0/0) to (1/1). An unfolded cube map of a landscape and a teapot reflecting it are shown.]

### Texture Mapping

Many surfaces are not monochrome, but have a pattern, e.g. wood grain, pictures on the wall, writing on paper, dirt, clothes, or marble. Even with coarse modeling, details can be interpreted as patterns, e.g. windows on a house wall, clouds in the sky, faces, buttons, zippers, or cobblestones. Such patterns are called textures. The application of textures is called *Texture Mapping*.

Once the textures have been created, texture mapping takes place in two steps. First, it must be defined which texture is to be applied to which surface of the objects and how it is to be oriented, scaled, etc. This is actually part of the modeling, where the surfaces are given an appearance. And in the second step, the texture must then be correctly rendered onto the image of the objects, i.e. transformed into the image.

[Figure: pipeline Texture Space ((u,v) array coordinates) → Texture-Object Transformation → Object Space ((u*,v*) surface parameters) → Viewing & Projection Transformation → Image Space ((x,y) pixel coordinates).]

### Creating a Texture

Basically, it doesn't matter where a texture comes from, it just has to be defined and accessible at all points. A texture is usually created as a pixel array in a pre-processing step and then only accessed. You can therefore use a photograph as well as a scan, but also a texture generated by a program or even random values. You can also create a database for frequently used textures such as wood grain, grass, sand, marble, cobblestones, or fabric structures. If you use textures that are obtained from a mathematical function, this is also known as "procedural texturing".

### Texture-Object-Transformation

Normally, the texture will be in a 2D coordinate system, which we want to address with (u, v). Furthermore, we want to assume that a surface to which the texture is to be applied also has a parametric representation, which we denote by (u*, v*). A bilinear function for applying the texture then looks like this:

`u* = u*(u, v) = au u + bu v + cu`,    `v* = v*(u, v) = av u + bv v + cv`

i.e. you can determine the corresponding color for each point of the object surface. This function is called texture-object transformation and is denoted by **MT**.

*Example:*

A texture t(u, v), `0 ≤ u, v ≤ 1`, is to be applied to a quarter cylinder with height h, whose surface is parameterized with v* in the z-direction and with u* (= θ) along the curvature. In order to calculate the position of a texture pixel t(u, v) [also called texel] in the cylinder, the mapping MT must be defined, which could be:

`u* = u · π/2`, `v* = v · h` (so the texture fits exactly on the cylinder quarter).

[Figure: a quarter cylinder of radius r and height h around the z axis, with angle θ measured from the x axis and a surface point (u*, v*).]

### Viewing and Projection Transformation

In itself, the mapping of the 3D model onto an image plane is a simple projection M_VP. In order to color each pixel exactly once when raster scanning the surfaces (i.e. to avoid overpainting and leaving holes), we now work in the opposite direction. For each pixel (x, y) you determine which surface point is drawn there (i.e. the (u*, v*) coordinates of the surface) and then from this which texel is valid for this pixel. This requires the inverse operators M_VP^-1 and M_T^-1.

*Example (continued):*

For any projection, it is sufficient if we know the (x, y, z) coordinates of each point. In the case of the cylinder above, this results in `x = r · cos u*`, `y = r · sin u*`, `z = v*`.

**Now the problem is approached in reverse:**

- For an image point P, first determine the position (x, y, z) on the cylinder that is represented there (e.g. by ray casting).
- For this point you have to find the parameters of the surface: `u* = cos^-1(x/r)`, `v* = z`. Up to this point, this is the inverse transformation M_VP^-1.
- Now the texture must be found for the parameter pair (u*, v*) by inverting MT: `u = 2u*/π`, `v = v*/h` (this is M_T^-1)

### Anti-Aliasing for Textures

Textures are particularly susceptible to aliasing effects, especially when the patterns are enlarged or reduced in size. The correct method would be to calculate the average texture value of the area generated by a back projection of the pixel to be filled onto the texture. As an approximation, the rectangle created by connecting the back-projected corner points is also sufficient. As this would be very slow, one of two optimizations is often used: *Mip-Mapping*, where the texture is precalculated in different sizes and then linearly interpolated, and the *Summed-Area-Table-Method*, where the average values of rectangular areas are easily determined from a summed texture by taking differences.

[Figure: a pixel back-projected into texture space covers a distorted quadrilateral spanning several texels.]

### Textures on Perspective Distorted Triangles

The use of barycentric coordinates results in a linear interpolation of the corner point values over the triangular surface. However, this linearity of the surface parameters is lost during the perspective transformation. Therefore, the interpolation must take place before the homogenization, as it is still linear there. Instead of calculating the color of a point `p(α, β, γ) = α·a + β·b + γ·c` with `color(x, y) = α·t0 + β·t1 + γ·t2`, barycentric coordinates (αw, βw, γw) are determined for the texture parameters u and v before the perspective and used to calculate the texture value at the point `p(α, β, γ) = p(x, y)`:

```
d  = h1 h2 + h2 β (h0 − h1) + h1 γ (h0 − h2)
βw = h0 h2 β / d
γw = h0 h1 γ / d
αw = 1 − βw − γw
u  = αw u0 + βw u1 + γw u2
v  = αw v0 + βw v1 + γw v2
color(x, y) = t(u, v)
```

[Figure: a grid texture on two triangles, mapped onto a perspectively distorted quadrilateral: with linear interpolation the grid lines kink at the diagonal, with correct interpolation they stay straight and foreshortened.]

### Solid Texturing

In addition to 2-dimensional form, a texture can also be given as a 3D volume. This means that a color is defined for each spatial point in a 3-dimensional parameter space, which is then retrieved from a surface located at this spatial point. With this method, the texture can either be given as a mathematical function or by volume data, the only important thing is that the values can be queried for each spatial point. The great advantage of solid texturing is that the patterns continue coherently over all edges, so that there can be no merging problems between any polygons. Furthermore, mapping the texture to the object is of course much easier to handle.

### Bump Mapping

Many surfaces have a detailed geometric structure: bark, coins, plaster, leather, fabric, vegetables, planets, gravel paths, lasagna, tiles, chocolate bars, earthworms, etc. Modeling such objects completely is very tedious and generates huge amounts of data. Bump mapping can significantly reduce this effort.

If you look at the gray bar on the right, you get the impression that it has six bumps and one indentation. But if you touch it, it is completely flat! Why do we see the unevenness? Because the shading alone is enough to create a spatial impression! This trick can be used to create the impression of surface irregularities (bumps) with little effort.

[Figure: a flat gray bar with seven shaded circles: six shaded light-on-top (appearing as bumps) and one shaded dark-on-top (appearing as an indentation).]

The basic idea is to leave the surface unchanged but to change the normal vector according to the bumps. As a result, the shading corresponds to the bumps, but geometrically nothing needs to be changed.

[Figure: smooth sphere + bump map of heights b over (u, v) = sphere that appears dimpled.]

### Bump-Mapping Algorithm

Let the bump texture be given in the form of an array of height values b(u, v), which means that the position of the point p(u, v) of the surface generated by the parameter pair (u, v) should appear shifted by b(u, v) in the direction of the normal vector n at this point. n is obtained by normalizing the cross product of two tangent vectors to the length 1:

`n* = pu × pv`,    `n = n*/|n*|`

The displaced point p′(u, v) then results in: `p′(u, v) = p(u, v) + b(u, v) · n`. However, we need n′, i.e. the normal to the shifted point:

`n′ = p′u × p′v`

Now the following applies:

`p′u = ∂(p + b n)/∂u = pu + bu n + b nu`

and because b is very small: `p′u ≈ pu + bu n`, analogously, of course, `p′v ≈ pv + bv n`, so that n′ results in:

`n′ = p′u × p′v = pu × pv + bv (pu × n) + bu (n × pv) + bu bv (n × n)`

and from `n × n = 0` finally follows: **`n′ = n + bv (pu × n) + bu (n × pv)`**.

You therefore do not need b(u, v) for the calculation, but the derivatives of u and v. Since in practice the parameterization of the surface and the bump texture are often the same, you can easily precalculate these derivatives and save them instead of b(u, v).

Note the difference between a texture map (top) and a bump map (bottom) in the donut illustration on the right. The spatial impression of the surface is only created when the shading is given a directional dependency.

[Figure: a bump-mapped orange; a torus with a texture map (looks flat-patterned) and the same torus with a bump map (looks rough and three-dimensional).]

Of course, bump mapping is just a big scam where the shading is changed without correcting the geometry. Accordingly, visible errors remain, which become all the more obvious the higher the bumps are:

1. at flat angles the structure is strongly distorted
2. the silhouette remains as smooth as the original geometry is (i.e. smooth = wrong)
3. therefore the object also casts shadows with smooth (= false) edges
4. the bumps do not cast shadows on each other
5. Surface normals on the side of an object facing away from the light can nevertheless be turned towards the light and then falsely receive light!

### Displacement Mapping

There are more or less complex workarounds for each of these errors, but the correct method is to actually change the surface by the bump height. This method is called displacement mapping. The surface points are actually shifted and a correct silhouette is naturally created. However, this is much more complex to implement but is supported by newer graphics cards. This is done by means of an additional programmable hardware stage in the rendering pipeline between the vertex and pixel stage ("tessellation stage"), which divides triangles directly on the hardware into many smaller triangles and can move them according to a displacement map.

### Combination of several Mappings

A very powerful method is to combine several mappings. In the case of textures, this is also called multi-texturing. Examples of combinable textures are basic patterns, lighting, dirt, and unevenness, but also, for example, photos plus annotations.

## Curves and Surfaces

In addition to the simple elements, many graphical data processing applications require the ability to model and display arbitrary surfaces (free-form surfaces). The principles are first explained using free-form curves, as their mathematics is simpler. The methods developed there can easily be extended to surfaces.

### Quadratic Surfaces

Frequently used surfaces can be defined implicitly, explicitly, or parametrically by formulas (analytical representation).

- In the implicit representation of a quadratic surface, all points (x, y, z), that fulfill its formula, simply lie on the shape's surface (example sphere: `x² + y² + z² = r²`).
- Explicit representations depict a coordinate value as a function of others (example sphere: `z = sqrt(r² − x² − y²)`).
- In a parametric representation (example sphere: `x = r · cos φ · cos θ`, `y = r · cos φ · sin θ`, `z = r · sin φ`, `−π/2 ≤ φ ≤ π/2`, `−π ≤ θ ≤ π`), a point on the shape's surface is generated for each combination of parameter values (in our sphere example (φ, θ)). Other commonly used quadratic surfaces include ellipsoids, toruses/tori, and quadrics.

### Curves

General curves can be defined either by a formula (analytical representation) or by specifying a set of support points or control points that determine the course of the curve. Since an analytical definition is much more difficult for the user to understand, the second method is normally used.

The following properties characterize different curve types:

- interpolation (curve runs through its support points) versus approximation (control points lie next to the curve)
- degree of continuity at connections
- global influence (all points influence every curve point) versus local influence (points only influence nearby curve parts)
- axis-dependent representations (rotation of the coordinate system changes the curve) versus axis-independent representations (rotation of the coordinate system does not change the curve)
- Tendency to damping at corners versus tendency to overshoot
- Possible curve shapes, restrictions, double points, closed curves, etc.

Curves that are defined by support or control points are also called splines. Some simple common spline methods are described below.

#### Cubic Spline Interpolation

Given n+1 interpolation points `p_i = (x_i, y_i(, z_i))`, i = 0, ..., n, an interpolation curve that consists of 2 interpolation points each (placed on a cubic polynomial) is called a cubic spline. The curve between interpolation points `p_k` and `p_(k+1)` is described by a parameter u:

`p_k(u) = a_k u³ + b_k u² + c_k u + d_k`, where k = 0, 1, 2, ..., n − 1 and `0 ≤ u ≤ 1`

(Note: a_k, b_k, c_k, d_k are vectors). To calculate a curve segment between 2 interpolation points, you need 4 segments. If the definition at the interpolation points is chosen such that the cubic polynomials there are connected both C¹-continuously (differentiable) and C²-continuously (2x differentiable, i.e. same curvature), we speak of natural cubic splines. These are obtained by solving a system of equations with 4n variables and specifying 2 constraints at the edges, e.g. curvature at the beginning and at the end is zero. Cubic splines have the disadvantage that each support point has an influence on the entire curve, i.e. it has a global influence.

[Figure: a smooth curve passing through interpolation points p0, p1, p2, ..., pk, pk+1, ..., pn.]

#### Hermite Interpolation

Hermite interpolation is a special form of cubic spline, for which, in addition to the interpolation points `p_k`, the derivatives `Dp_k` are also specified at the interpolation points. The cubic interpolation polynomial `p_k(u)`, `0 ≤ u ≤ 1`, between points `p_k` and `p_(k+1)` can then be calculated uniquely from the 4 determinants:

`p_k(0) = p_k`, `p_k(1) = p_(k+1)`, `p'_k(0) = Dp_k`, `p'_k(1) = Dp_(k+1)` für k = 0, ..., n − 1

`p_k(u) = a_k u³ + b_k u² + c_k u + d_k` can also be written in matrix notation, as well as the first derivative of this curve `p'_k(u) = 3 a_k u² + 2 b_k u + c_k`. From this, the 4 determinants `p_k`, `p_(k+1)`, `Dp_k`, `Dp_(k+1)` can be formulated:

```
p_k(u)  = [u³, u², u, 1] · [a_k, b_k, c_k, d_k]ᵀ
p'_k(u) = [3u², 2u, 1, 0] · [a_k, b_k, c_k, d_k]ᵀ

[p_k, p_(k+1), Dp_k, Dp_(k+1)]ᵀ = [[0, 0, 0, 1],
                                   [1, 1, 1, 1],
                                   [0, 0, 1, 0],
                                   [3, 2, 1, 0]] · [a_k, b_k, c_k, d_k]ᵀ
```

To calculate the coefficient vectors a_k, b_k, c_k, d_k of `a_k u³ + b_k u² + c_k u + d_k`, this matrix is inverted. The resulting matrix is called the Hermite matrix M_H:

```
[a_k, b_k, c_k, d_k]ᵀ = [[0, 0, 0, 1],
                         [1, 1, 1, 1],
                         [0, 0, 1, 0],
                         [3, 2, 1, 0]]^(-1) · [p_k, p_(k+1), Dp_k, Dp_(k+1)]ᵀ

                      = [[ 2, -2,  1,  1],
                         [-3,  3, -2, -1],
                         [ 0,  0,  1,  0],
                         [ 1,  0,  0,  0]] · [p_k, p_(k+1), Dp_k, Dp_(k+1)]ᵀ

M_H = [[2, -2, 1, 1], [-3, 3, -2, -1], [0, 0, 1, 0], [1, 0, 0, 0]]

p_k(u) = [u³, u², u, 1] · M_H · [p_k, p_(k+1), Dp_k, Dp_(k+1)]ᵀ
```

#### Bézier Curves

Around 1960, Pierre Bézier described an approximating curve for the description of car bodies at Renault, in which the so-called Bernstein polynomials `b_(k,n)` are used as weight functions for the control points. Each curve point is the weighted average of all control points:

`p(u) = Σ_(k=0..n) p_k · b_(k,n)(u)`, `0 ≤ u ≤ 1`, where `b_(k,n)(u) = (n choose k) · u^k · (1 − u)^(n−k)`   (1)

As you can see, the weight functions `b_(k,n)(u)` are defined over a parameter range u in the range from 0 to 1, and depend on 2 values: n is the number of support points of the curve (strictly speaking, there are n + 1 support points) and k specifies the support point for which the weight function is used. Each of these values (except at the edges u = 0 and u = 1) is greater than zero, i.e. not equal to zero. Since the sum of `b_(k,n)(u)` over all k is 1 everywhere, each point of the curve p(u) is therefore a weighted mean value over all interpolation points.

For 4 control points (i.e. n = 3), for example: `p(u) = (1 − u)³ · p0 + 3u(1 − u)² · p1 + 3u²(1 − u) · p2 + u³ · p3`

[Figure: three example cubic Bézier curves with control points p0 to p3; each curve starts at p0, ends at p3 and stays inside the convex hull of the control points, which pull the curve towards them.]

Properties of Bézier curves:

- for n + 1 control points is p(u) of degree n
- each control point tightens the curve like a rubber band
- global influence (weight function almost everywhere > 0)
- p0 and pn lie on the curve
- the tangents in p0 and pn are the connection to the next points p1 and p(n−1)
- the curve lies entirely in the convex hull of the control points (the convex hull is the smallest convex polygon that contains all control points)

Some of these properties can be recognized from the form of the Bernstein polynomials `b_(k,n)`:

[Figure: plots of the four cubic Bernstein polynomials over u in [0, 1]: `b_(0,3)(u) = (1−u)³`, `b_(1,3)(u) = 3u(1−u)²`, `b_(2,3)(u) = 3u²(1−u)`, `b_(3,3)(u) = u³`.]

#### B-Spline Curves

The main disadvantage of Bézier curves is the global influence of the control points on the entire curve. This has two main disadvantages:

1. any change to the control points (insertion, removal, moving) changes the appearance of the curve at all points, and
2. the calculation time for large control point sets is higher.

The reason lies in the form of the weight functions. The so-called B-splines approximate curves just like the Bézier splines, but the Bernstein polynomials are replaced by B-spline polynomials `B_(k,d)`. These limit the number of control points that influence a curve point to d. The calculation of `B_(k,d)` is somewhat more complex and is done recursively, but it is sufficient to see the form of the B-spline polynomials to understand it. It can be seen that each weight curve is only non-zero in a limited range, i.e. that each point has no influence on the curve over wide ranges (the figure shows the weight functions `B_(2,4)` to `B_(6,4)` for n = 8).

[Figure: bell-shaped, shifted B-spline weight functions B_(2,4) to B_(6,4) plotted over the parameter range 0 to 8, each non-zero only over a limited interval.]

An important property of the B-spline weight functions is the fact that (as with Bernstein polynomials) their sum is exactly 1 for each curve point. Each B-spline curve point is therefore a weighted average of the control points.

`Σ_(k=0..n) B_(k,d)(u) = 1`

Examples of B-spline curves with d=3 (left) and d=4 (right).

If you choose d = n + 1, you get Bézier curves, which are a special case of B-splines.

The main differences to Bézier curves are

- local influence of the control points
- effort linear to the number of control points (instead of quadratic for Bézier curves)

The most important extensions of these so-called uniform B-splines lead to Non-Uniform Rational B-Splines, better known as NURBS. These can also be used to consistently represent regular geometric shapes.

Please note that all the methods described apply equally to points in two and three dimensions. In principle, therefore, all these splines describe spatial curves in three-dimensional space.

### Free-Form Surfaces

#### Bézier- and B-Spline Surfaces

If the Cartesian product of two sets of curves is formed over a two-dimensional point grid, free-form surfaces are obtained in a natural way. Depending on the underlying curve type, different surfaces are obtained, e.g. Bézier surfaces from Bézier curves, B-spline surfaces from B-spline curves, etc.

`p(u, v) = Σ_(j=0..m) Σ_(k=0..n) p_(j,k) · b_(j,m)(v) · b_(k,n)(u)`

Each pair of parameters (u, v) leads to a point on the resulting surface. In this Bézier example, the boundary curves of the surface are again Bézier curves. The other properties of the Bézier curves are also transferred to the surfaces.

Analogous to these Bézier surfaces, B-spline surfaces are obtained by inserting the B-spline weight functions into the formula, or NURBS surfaces for NURBS curves.

To draw freeform surfaces, triangle meshes can be generated from the surfaces, which are rendered like B-reps. Alternatively, ray-casting methods can be used: to do this, a procedure must be implemented that calculates the intersection point of a straight line with the surface as accurately as possible and also returns the surface normal at said point.

## Computer Animation

### Transformations

An affine transformation, consisting of both a translation and rotation, can be expressed by a homogeneous 4x4 matrix:

`[[R, x], [0, 1]]`, with `R ∈ R^(3×3)` being the rotational component and `x ∈ R³` representing the translation.

#### Translation

If we assume no rotation, an object with an initial position `p(t0) ∈ R³` at time t0 can be moved to a target position `p(t1)` at time t1 via:

`p(t1) = [[1, x], [0, 1]] · p(t0)`

We can obtain the objects position at an arbitrary time `t ∈ R`, with `t0 < t < t1` using linear interpolation between the start and end positions:

`p(t) = p(t0) + (p(t1) − p(t0)) · (t − t0) / (t1 − t0)`

#### Rotation

Matrix representations of rotations face many difficulties, such as the Gimbal Lock: Usually, when you rotate an object in 3D space you have three degrees of freedom. Using matrices for rotation, there are however configurations, where an object is rotated in a way such that two axes are parallel. In the image to the right, for example, the pink and green circle "lock" and it does not make a difference anymore whether you rotate the inner blue ring or the outer pink ring. We thus have lost one degree of freedom.

[Figure: a gimbal with three nested rings (pink outer, green, blue inner) around an object, where the pink and green rings lie in the same plane.]

One solution is to use Quaternions to represent rotations and spherical interpolation. Quaternions are an extension of complex numbers and consist of a scalar component `s ∈ R` and a vector component `v ∈ R³`. To rotate around an arbitrary axis `n ∈ R³` by an angle ϕ, you can convert this axis-angle representation of a rotation to a quaternion q as follows:

`q = [s; v] = [s x y z] = [cos(ϕ/2); sin(ϕ/2) · n]`

`q(t) = slerp(q(t0), q(t1), t) = q(t0) · (q(t0)^(-1) · q(t1))^t`

To finally compute a rotated position p(t) at an arbitrary time t, we apply the interpolated rotation q(t) to the initial position p(t0). To achieve this, we first form a new quaternion by taking p(t0) as the vector component and zero as the scalar component. The result of the product with the computed rotation q(t) is again a quaternion with zero as the scalar component and the vector component is our desired, rotated position p(t):

`[0; p(t)] = q(t) · [0; p(t0)] · q(t)^(-1)`

#### Keyframing

Keyframing achieves complex animations with a balance between automation and manual specification. Scene parameters are specified only at specific points in time and otherwise interpolated. We can encode parameter changes over time in a table as seen below. In particular, we refer to the time steps as frames and we call each combination of a time t and set of scene parameters f at that point in time a keyframe k. In our case this set of scene parameters f consists of position p, color c and a rotation represented by a quaternion q, thus yielding keyframe `k : (t_k, f(t_k)) = (t_k, (p(t_k), c(t_k), q(t_k)))`. Note, however, that you may also only specify a subset of the scene parameters as is the case for frames 2 and 3 in our example.

| Time     | 0 | 1 | 2 | 3 | 4 | 5 |
|----------|---|---|---|---|---|---|
| Position | ● |   | ● | ● |   | ● |
| Color    | ● |   |   |   |   | ● |
| Rotation | ● |   |   | ● |   | ● |

[Figure: next to the table, the keyframed position values are connected by straight line segments, with the color (white at frame 0, blue at frame 5) and rotation shown at the frames where they are specified.]

Instead of linearly changing an object's position, fitting an interpolating curve through all keyframe positions results in smoother movement. Depending on the curve construction method, there can be sudden jumps around the keyframe positions and the speed or velocity the object has along the curve may vary non-uniformly (which is bad for smooth camera movement for example).

Ideally, when we sample the time uniformly, we would expect our spatial sampling points also to be uniformly spread along the curve. In reality, however, most curve fitting techniques cluster the spatial samples in some way. One solution to this problem would be, to not uniformly sample the time. Instead, we could approximate the length of the curve called arc length, and then uniformly sample this arc length, meaning we divide the curve into segments of equal length.

[Figure: "Ideal" vs. "Reality": a curve through keyframes t0 to t3 with sample markers evenly spaced along the curve (ideal) versus unevenly clustered (reality).]

To achieve this, we introduce the distance-time function `s(t) : R → R`. It basically tells us how far we have already traveled along a curve, meaning it assigns each time the distance up until this point. While s(t) is originally continuous, we can discretize it and approximate the distance between two-time samples by using their Euclidian distance, thus approximating the shape of the curve by a number of linear line segments:

`s(t_i) ≈ s(t_(i−1)) + ||p_i − p_(i−1)||`

We can store these approximated values of our distance-time function s in a look-up table. When we then uniformly sample s(t), we recompute the values t, which we need to evaluate our curve using this look-up table and linear interpolation. By non-uniformly sampling the time, we have thus achieved an approximately uniform space sampling.

**Example:**

In the following we assume we have some way of computing the exact distance-time function, leading to the pink values in the figure below. You can see an example of computing an approximation of s(t) at time t = 0.6̅ (= 2/3) on the right using the Euclidean distance between p_0.3̅ and p_0.6̅ (also assumed to be given).

[Figure: a curve through t0 to t3 with sample points labeled by their distance values 0.0, 0.5, 3.5, 4.5, 5.0, 7.0, 8.0, 9.5, 12.0, 13.0; the straight segment between the samples at t = 1/3 and t = 2/3 has length l = 2.8.]

Look-up table:

| t     | s(t) |
|-------|------|
| 0     | 0.0  |
| 1/3   | 0.5  |
| 2/3   | 3.5  |
| 1     | 4.5  |
| 1 1/3 | 5.0  |
| 1 2/3 | 7.0  |
| ...   | ...  |

Approximate s(t):

`s(t_0.6̅) ≈ s(t_0.3̅) + l = 0.5 + 2.8 = 3.3`

By comparing our approximation of 3.3 to the real value of 3.5 stated in the figure on the right, we notice we made an error of 0.2.

Next, we uniformly sample s(t) at e.g. 0.0, 1.0, 2.0, ... and recompute the values t at which we want to evaluate our curve using linear interpolation. For example, when we sample s(t) at s = 6.0:

`t = (1.3̅ + 1.6̅) / 2 = 1.5`, as 6.0 is in the middle of 5.0 and 7.0 (see table).

### Deformations

Deformations can be formalized as applying a function f to each vertex position p to compute the new, deformed position `p' = f(p, γ)`, based on some additional parameters γ. Some simple deformations can be applied in the form of non-constant matrices – for example the so-called tapering, bending, and twisting operations. Alternatively, if you want to model a not-as-nicely-behaved deformation, one solution might be to use a deformation cage to reduce the number of vertex positions you manually have to specify. The vertex positions of the object are "bound" to the cage and whenever the cage is moved, their position changes as well.

[Figure: a sphere mesh with a lattice cage around one side; moving the cage pulls that part of the sphere out into a deformed shape.]

### Physically-based Simulation

An object is represented by multiple points connected via constraints and simulated based on physical laws.

Point:

- Position `p ∈ R³`, [m]
- Velocity `v = dp/dt ∈ R³`, [m · s⁻¹]
- Acceleration `a = dv/dt = d²p/dt² ∈ R³`, [m · s⁻²]
- Mass `m ∈ R`, [kg]

Constraint:

- Rigid: Distance/Volume stays the same, Transformation only (wooden cubes, steel sword)
- Soft: Distance/Volume can change, Transformations & Deformations (cloth, soft tissue)

Our main interest lies in simulating the positions p. To achieve this, we also consider the change of positions over time, which is called velocity. If the velocity v is constant (meaning it is not time-dependent), we can compute the future position p(t+∆t) of a point after taking an arbitrary timestep ∆t based on the current position p(t) at time t as follows:

`p(t+∆t) = p(t) + ∆t · v`

This way, the motion of the point would be at constant speed along a straight line (Newton's first law). We can change the velocity by exerting a force `F ∈ R³`, [kg·m·s⁻²], such as gravity, upon our body. The change of velocity is called acceleration a, which can be computed using Newton's second law `F = m · a ⇒ a = F / m`. If we assume both a varying velocity and a varying force, computing p(t+∆t) involves solving multiple integrals.

#### Numerical Integration

Explicit Euler:

```
p(t+∆t) = p(t) + ∆t · v(t)
v(t+∆t) = v(t) + ∆t · a(t)
a(t)    = F(t) / m
```

unstable at large timesteps (high deviation/oscillations), easy to compute, real-time

Implicit Euler:

```
p(t+∆t) = p(t) + ∆t · v(t+∆t)
v(t+∆t) = v(t) + ∆t · a(t+∆t)
a(t+∆t) = F(t+∆t) / m
```

unconditionally stable, computationally evolved (requires solving equation system), offline

Semi-Implicit Euler:

```
p(t+∆t) = p(t) + ∆t · v(t+∆t)
v(t+∆t) = v(t) + ∆t · a(t)
a(t)    = F(t) / m
```

energy conserving, easy to compute, real-time

```
// Explicit Euler
Vec3 F = computeForce();
Vec3 acceleration = F * object.inverseMass;
object.position += object.velocity * deltaTime;
object.velocity += acceleration * deltaTime;
```

```
// Semi-Implicit Euler
Vec3 F = computeForce();
Vec3 acceleration = F * object.inverseMass;
object.velocity += acceleration * deltaTime;
object.position += object.velocity * deltaTime;
```

#### Differential Equations

So far, we have looked at so-called particle-based simulations, where we approximate a shape by multiple points. This is also referred to as the Lagrangian view on simulation. Another approach is to divide the space using an often uniform grid, which is then called the Eulerian view. Our ultimate goal in physics-based simulation is to solve differential equations.

[Figure: "Particle-based" (a fluid represented by moving particles) vs. "Grid-based" (a fluid represented on a uniform grid of cells with velocity vectors).]

Differential equations are simply equations, which contain a function and its derivatives. So far we have looked at ordinary differential equations (ODEs), which only contain full derivatives (written as `dp/dx`, `p'(x)` or sometimes `ṗ`), such as Newton's second law `F(t, p, v) = m · d²p(t)/dt²`.

A bit more complex are partial differential equations (PDEs), which contain a multi-dimensional function with multiple parameters and its partial derivatives (written as `∂p/∂x` or `∂_x p`) with respect to only one of these parameters. An example is the 2D heat equation (2), which describes the way heat diffuses along a 2D surface. In the image below you can see a heightfield visualization of an exemplary scalar heat field. Other use cases are for example acoustic waves or fluid simulations (here the underlying PDE is the Navier-Stokes Equation). One technique to numerically compute derivatives (most PDEs do not have an analytical solution) are so called Finite Difference Methods (see for example 3). The unknown values are then computed using again explicit or implicit schemes.

`∂h/∂t = α · (∂²h/∂x² + ∂²h/∂y²)`, with `h : Ω ⊂ R² → R`   (2)

`∂u(x, t)/∂x ≈ (u(x + ∆x, t) − u(x, t)) / ∆x`   (3)

[Figure: space-time grids with rows for initial conditions (t0), current values (t) and unknown values (t + ∆t). In the explicit scheme, one unknown value at t + ∆t is computed from neighboring current values at x and x + ∆x; in the implicit scheme, several neighboring unknown values at t + ∆t are coupled together with the current value.]

### Character Animation

Linear blend skinning (LBS) is a simple method of computing updated skin vertex positions based on the deformation of an underlying skeleton resulting from rigging a character. Each joint j is assigned a transform `T_j` (which can also depend on a hierarchy of joints and for example be represented as a matrix `T_j ∈ R^(4x4)`). Each joint j has an individual influence on each vertex i, captured by the weight `w_(i,j)` (see image on the right). To now move a vertex i from its original position `p_i` to a deformed position `p'_i`, we sum over the weighted contributions of all joints (n is the number of joints): `p'_i = (Σ_(j=1..n) w_(i,j) · T_j) · p_i`

[Figure: a character's arm colored by the skinning weight of one joint, from 0 (blue) to 1 (red).]

LBS comes with multiple issues, however, such as high manual effort or the "candy-wrapper" artifact you can observe in the left image. Alternatively, we could use ragdolls based on physically-based simulation or motion capture, where the movement of real humans is captured directly via cameras and markers on the actors, and then transferred to a virtual character.

### Procedural Techniques

Similar to physically-based simulations, procedural techniques can be used to automatically create animations. They follow a certain set of rules combined with randomization to create plausible animations, however not with the goal of physical correctness. One famous example is the Game of Life, which is a cellular automata. Other procedural methods involve particle systems (rain, snow, fire) or boid/swarm behaviour.

## Machine Learning for 3D Graphics

### Machine Learning and Neural Networks

[Figure: nested boxes showing the hierarchy ML ⊃ NN ⊃ DL ⊃ GM.]

Machine Learning (ML) is a branch of artificial intelligence focused on developing algorithms that learn from data to make predictions or decisions. It involves optimizing parameters to model relationships within data. A basic example is linear regression, where parameters are adjusted to best fit a set of data points.

Neural Networks (NNs), fundamental to ML, consist of interconnected nodes that process inputs to produce outputs. They work by multiplying input vectors with weight matrices and applying activation functions like ReLU or Sigmoid. Despite their simplicity, these networks are powerful enough to solve a wide range of tasks.

Deep Learning (DL) is a subset of ML that uses neural networks with many parameters to tackle complex problems. DL excels in tasks like image classification, where images are sorted into categories, and segmentation, where different parts of an image are identified. It can also handle style transfer, which modifies the style of images while keeping their content intact, and novel view synthesis, which creates new perspectives of 3D objects from limited data.

Classifiers are a machine learning application where high-dimensional input data, such as images, are transformed into lower-dimensional output, typically a class label. Class labels can, for example, be represented by categories like "human", "dog", or "bird". The trapezoid symbol in classifiers represents this dimensional reduction, indicating how raw data is condensed into specific categories through the classification process.

### Generative Models

Generative Models (GM), a subset of DL, are a class of statistical models that are used for generating new data instances. These models learn to capture the probability distributions of the data they are trained on, enabling the generation of new data points with similar characteristics. Key types of generative models include:

- **Auto-Encoders** which learn to compress input data into a smaller representation and then reconstruct the output from this representation.
- **Generative Adversarial Networks (GANs)**, which consist of a generator that creates samples and a discriminator that evaluates them.
- **Diffusion Models** use the idea of reverse diffusion (i.e. noise removal) to iteratively generate output from random noise.

[Figure: top, an image of a bird goes into a Classifier (a trapezoid narrowing to the right) which outputs 'bird'; bottom, the text 'bird' goes into a Generator (a trapezoid widening to the right) which outputs an image of a bird.]

Conceptually, a generative model can be thought of as running a classifier backward. In a classifier, a high-dimensional input such as an RGB image is assigned a class in a lower dimensional space consisting of a number of class labels (this reduction of dimensionality is represented by the symbol for a classifier, a trapezoid narrowing towards the output). In a generative model, on the other hand, we take input with low dimensionality such as a text prompt, and want to output an RGB image (hence the symbol for a generator is a mirror image of the classifier symbol). However, we do not want to just reconstruct one instance of a bird, for example, but we want different instances of birds and also a way to control which instances are to be created. This necessitates additional inputs into the generator. To achieve this variability, random noise is introduced. This noise serves to map from a distribution of random inputs to a desired distribution of outputs – specifically, various representations of birds.

Inside the model, the data are contained within a high-dimensional latent space. This space comprises points defined by latent variables, which encode characteristics of our bird such as color and size. Initially, these variables are randomized. However, to exert control over specific attributes of the generated output, they are deliberately manipulated. For example, in a two-dimensional representation of this space, the "u" coordinate might dictate the orientation of the bird (left, front, right), while the "v" coordinate could determine the background context (blue sky, green leaves). However, the latent variables are not always perfectly distinct; changes in one can inadvertently affect others, such as a right-facing bird causing the background to appear brown—a phenomenon known as variable entanglement.

[Figure: a 2D latent space with axes "orientation" and "background", and a grid of generated bird images varying along these two axes.]

### Using Generative Models to Create Images

So far, we have seen a high-level overview of the input and output of a generative model. Now we take a look at what is necessary to actually build a generative model for creating images. Here, our first step is selecting an architecture, such as Generative Adversarial Networks (GANs) or Diffusion Models. The training process involves using a large dataset of images, sometimes with labels, to teach the model to generate new images accurately. During inference, the model applies what it has learned to produce new images based on new inputs. This allows for the controlled generation of specific features in the output, like color and size.

#### Training a Generative Adversarial Network (GAN)

[Figure: a random latent vector goes into the Generator; its generated images and real images both go into the Discriminator; a Generator Loss and a Discriminator Loss are computed from the Discriminator's output.]

In Generative Adversarial Networks (GANs), two neural networks, the Generator and the Discriminator, engage in a competitive game. The Generator's role is to produce images from random latent vectors that are indistinguishable from real images, effectively trying to "fool" the Discriminator. Conversely, the Discriminator's job is to accurately distinguish between the generated images and actual real images. This process involves two loss functions which are simultaneously optimized to improve both the Generator's ability to deceive and the Discriminator's ability to detect fakes. It is crucial that the loss functions are differentiable to support backpropagation during training, enhancing the learning and adaptation capabilities of both networks.

#### Training a Diffusion Model

[Figure: real images pass through an Encoder and text prompts through a Text Encoder; the results are concatenated, noise is iteratively added (Diffusion), and a Noise Detector predicts how much noise was added.]

Diffusion models are trained by encoding both images and textual prompts into a shared latent space, where noise – typically Gaussian for its probabilistic properties – is iteratively added to the images. This added noise allows the model to learn from the 'noisy' data using a noise detector that predicts the level of noise at each step. The purpose here is for the denoiser to learn to predict and subsequently subtract the noise based on the noisy image and associated text input. This learning process ensures that each iteration moves the image closer to a less noisy and more accurate representation.

#### Inference in a Diffusion Model

[Figure: random noise passes through an Encoder and the prompt 'Drawing of a bird on a white background' through a Text Encoder; the results are concatenated, a Noise Detector predicts how much noise is present, the predicted noise is removed (repeatedly), and a Decoder produces the final image.]

During the inference phase of a Diffusion Model, the generation process begins with a text prompt and a patch of random Gaussian noise. Both are encoded into the latent space and continually refined through a series of noise detection and subtraction steps. At each iteration, the noise detector estimates the amount of noise present, and this noise is then subtracted to gradually clarify the image. This sequence continues until the image is sufficiently denoised, at which point the latent representation is decoded back into a visual image by a decoder, typically structured as a Variational Auto-Encoder. The resulting images, which start from generalized noise and text inputs, demonstrate the model's capability to generate detailed and contextually appropriate visuals from a high-dimensional latent space.

Now, we have a tool to generate 2D images given some text input; however, what we want is to generate 3D models and scenes. For that, we need a bit more.

### Scene Representations for 3D Machine Learning

A real object cannot be accurately represented so that the representation captures every single detail. Therefore, there are many different representations, each with its own advantages and disadvantages. In general, they can be subdivided into two categories: implicit and explicit. Implicit representations are functions that at each point in space define a value, whether the object is there or not, its color, or how far away is the closest surface (e.g., Signed Distance Functions (SDFs)). Explicit representations are usually sets of discrete elements, e.g., a triangle mesh, grid, or point cloud. Depending on the task, some representations may be more suitable than others.

Let us take for example point clouds. If we scan a real object and get a finite set of points, there is no straightforward way to ensure that if we render the points, we will have no holes through which we can see what is behind the object. We could try to "close" them and construct a mesh. However, when training with the mesh, it is important to ensure it does not become deformed and invalid, which can occur if vertices move freely and faces intersect. Therefore, it is always important to consider which representation is suitable.

### Neural Radiance Fields (NeRFs)

NeRFs offer an implicit representation of spatial data, utilizing the weights within a neural network to model 3D environments. This process is classified under deep learning within the machine learning hierarchy, requiring substantial computational resources. The core mechanism of a NeRF involves sampling along a ray in 3D space, a method driven by a multi-layer perceptron (MLP). As the ray traverses the scene, the model evaluates the color and density at various points along the path, ultimately projecting and blending these values to produce the final image. This projection condenses the volumetric data into a singular color value per sampled ray, representing a highly detailed rendering of the scene.

If we wish to reconstruct a real scene, we need ground truth images. We can use the Structure-from-Motion algorithm to obtain their corresponding camera poses, from which the scene gets rendered. Then, we can compare the rendered image with its corresponding ground truth image and optimize the network to match them. NeRFs rely on neural networks, which are black boxes. This means that directly changing one part of a scene, e.g., removing an object, is very difficult. Therefore, before editing it may be necessary to first convert it into an explicit representation, e.g., a mesh using the marching cubes algorithm. Nevertheless, NeRFs have proven to be very powerful and are widely used nowadays.

### Gaussian Splatting

In contrast, Gaussian Splatting is an explicit scene representation technique that leverages the principles of volume rendering, but employs Gaussian functions as primitive shapes. Unlike NeRFs, Gaussian Splatting does not require deep neural networks and can be thought of as a soft point cloud, where each Gaussian is defined by its mean (position), covariance matrix (shape), opacity, and color. Instead of a NN, it utilizes a straightforward machine learning approach, such as stochastic gradient descent, to learn the spatial features of the scene. The rendering process in Gaussian Splatting involves projecting the 3D Gaussians onto a 2D plane, and then rasterizing the projected data to form the image. Each Gaussian's contribution to the final image is sorted and sampled in the 2D space, allowing for efficient rendering without the intense computational demand of deep learning architectures.

The training for reconstruction starts with an initial set of Gaussians. These Gaussians can be obtained using the Structure-from-Motion algorithm, which outputs (together with the camera poses) a set of 3D points that match the ground truth images. Then, the points can be directly transformed into Gaussians by setting their covariance matrices, so that they and their close neighbors create surfaces without holes, but potentially with a considerable overlap. As the initial set of Gaussians may not be enough to represent all the details in the scene, they need to be either cloned or split, which can be determined by the accumulated magnitude of their positional gradients flowing into individual Gaussians. This magnitude indicates how badly placed the Gaussians are. So, if the gradient is large, it either indicates that it needs to move somewhere rapidly or that it needs to be at multiple different locations at once—so it gets cloned or split. This way we can obtain a high-quality 3D representation with more Gaussians and thus more details where needed.

### Generative Models for 3D Objects

At this point, we know how to generate 2D images and how to reconstruct a real-life scene. But what about combining these two? We can utilize the process of iteratively changing/denoising images to generate new ones together with iteratively changing a 3D object representation. Here we describe how to combine a diffusion model and 3D Gaussian Splatting to synthesize new 3D objects.

Once we know what we want to create, i.e., we have a text prompt, we need to get an initial set of Gaussians that will be further refined. This can either be done manually or by using a pre-trained network that can generate (nowadays usually rough and not particularly good-looking) point clouds based on a text prompt. These points can be converted into Gaussians using the same process as during scene reconstruction. They then get rendered from random viewpoints ("Splatting Renderer"). These renderings are 2D images and we can use a diffusion model to inform how they should be changed to match the prompt. The only thing missing is that diffusion models work with noisy images and thus we need to add noise artificially. Based on how the diffusion model wants to change the rendered images, we can change the underlying 3D object representation. Furthermore, we need to split and clone Gaussians to add more detail, which, again, can be done by considering the magnitude of their gradient. After several hundreds or thousands of iterations, we have a new 3D object created automatically.
