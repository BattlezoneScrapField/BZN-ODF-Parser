# BZN Object (ODF) Parser ♻️

A lightweight web utility for analyzing **Battlezone: Combat Commander / Battlezone II `.BZN` map files** that have been saved in **ASCII format**. The tool parses object definitions within the map and produces a summarized view of the **ODF (Object Definition File) instances** used on the map.

The application runs entirely in the browser using **HTML, CSS, and vanilla JavaScript**. No backend services, build steps, or frameworks are required.

# Overview

The parser reads `.BZN` files and identifies all `objClass=` entries, which correspond to **ODF names** used by map objects. These are counted and displayed in an interactive table.

Typical uses:

* Inspect what objects a map uses
* Quickly count vehicles, buildings, or other entities
* Compare design patterns between maps
* Audit custom maps before publishing

The site is designed to work locally or when hosted on **GitHub Pages**.

# Parsing Logic

The application searches the file contents using a regular expression:

```
objClass\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s\r\n;]+))
```

This detects lines such as:

```
objClass = ivtank
objClass="ibfact"
objClass='apcamr'
```

Each discovered value is treated as an **ODF identifier**.

The parser counts occurrences using a JavaScript `Map`.

Example output structure:

```
{
  ivtank: 4,
  ibfact: 1,
  apcamr: 3
}
```

# Results Table

The results are displayed in a sortable table with the following columns.

| Column   | Description                                      |
| -------- | ------------------------------------------------ |
| Icon     | Object type icon derived from ODF prefix         |
| ODF Name | The object definition name found in the BZN file |
| Quantity | Number of times the object appears               |

### Icon Detection

Icons are chosen using the **second character of the ODF name**.

Examples:

| Prefix | Category |
| ------ | -------- |
| `iv`   | Vehicle  |
| `ib`   | Building |

Icons are loaded from the `/icons` folder.

Example:

```
icons/vehicle.png
icons/building.png
icons/object.png
```

Icons are displayed using:

```
object-fit: contain
```

This prevents distortion when scaling PNG assets.

# Hosting
The site is designed to be deployed on **GitHub Pages**.
Deployment is automated by publishing the repository contents to Pages whenever the `main` branch is updated.
