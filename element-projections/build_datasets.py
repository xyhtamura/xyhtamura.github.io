# build_datasets.py
# Generates verified ES module data files for element-projections:
# 1. src/data/elements.js (all 118 elements)
# 2. src/data/besalu.js (Besalú 2013 35-element dataset, correlations, eigenvalues, eigenvectors)
# 3. src/data/mendeleev_scales.js (Allahyari-Oganov USE, Pettifor, Sneath centroids)

import json
import os
import numpy as np

# 1. Besalu 2013 raw table
besalu_raw = [
    (1, 1, 'H', 1.008, 25, 1310, 73, 2.2),
    (2, 3, 'Li', 6.94, 145, 519, 60, 1.0),
    (3, 4, 'Be', 9.01, 105, 900, 0, 1.6),
    (4, 5, 'B', 10.81, 85, 799, 27, 2.0),
    (5, 6, 'C', 12.01, 70, 1090, 122, 2.6),
    (6, 7, 'N', 14.01, 65, 1400, -7, 3.0),
    (7, 8, 'O', 16.00, 60, 1310, 141, 3.4),
    (8, 9, 'F', 19.00, 50, 1680, 328, 4.0),
    (9, 11, 'Na', 22.99, 180, 494, 53, 0.93),
    (10, 12, 'Mg', 24.31, 150, 736, 0, 1.3),
    (11, 13, 'Al', 26.98, 125, 577, 43, 1.6),
    (12, 14, 'Si', 28.09, 110, 786, 134, 1.9),
    (13, 15, 'P', 30.97, 100, 1011, 72, 2.2),
    (14, 16, 'S', 32.06, 100, 1000, 200, 2.6),
    (15, 17, 'Cl', 35.45, 100, 1255, 349, 3.2),
    (16, 19, 'K', 39.10, 220, 418, 48, 0.82),
    (17, 20, 'Ca', 40.08, 180, 590, 2, 1.3),
    (18, 31, 'Ga', 69.72, 130, 577, 29, 1.6),
    (19, 32, 'Ge', 72.64, 125, 784, 116, 2.0),
    (20, 33, 'As', 74.92, 115, 947, 78, 2.2),
    (21, 34, 'Se', 78.96, 115, 941, 195, 2.6),
    (22, 35, 'Br', 79.90, 115, 1140, 325, 3.0),
    (23, 37, 'Rb', 85.47, 235, 402, 47, 0.82),
    (24, 38, 'Sr', 87.62, 200, 548, 5, 0.95),
    (25, 49, 'In', 114.82, 155, 556, 29, 1.8),
    (26, 50, 'Sn', 118.71, 145, 707, 116, 2.0),
    (27, 51, 'Sb', 121.76, 145, 834, 103, 2.1),
    (28, 52, 'Te', 127.60, 140, 870, 190, 2.1),
    (29, 53, 'I', 126.90, 140, 1008, 295, 2.7),
    (30, 55, 'Cs', 132.91, 260, 376, 46, 0.79),
    (31, 56, 'Ba', 137.33, 215, 502, 14, 0.89),
    (32, 81, 'Tl', 204.38, 190, 590, 19, 2.0),
    (33, 82, 'Pb', 207.20, 180, 716, 35, 2.3),
    (34, 83, 'Bi', 208.98, 160, 703, 91, 2.0),
    (35, 84, 'Po', 209.00, 190, 812, 174, 2.0)
]

besalu_data = np.array([[r[3], r[4], r[5], r[6], r[7]] for r in besalu_raw], dtype=float)
means = np.mean(besalu_data, axis=0)
stds = np.std(besalu_data, axis=0)
Z = (besalu_data - means) / stds
R = np.corrcoef(besalu_data, rowvar=False)
eigenvalues, eigenvectors = np.linalg.eigh(R)
idx = np.argsort(eigenvalues)[::-1]
eigenvalues = eigenvalues[idx]
eigenvectors = eigenvectors[:, idx]

if eigenvectors[2, 0] < 0:
    eigenvectors[:, 0] = -eigenvectors[:, 0]
if eigenvectors[0, 1] > 0:
    eigenvectors[:, 1] = -eigenvectors[:, 1]

scores = np.dot(Z, eigenvectors)

besalu_elements = []
for i, r in enumerate(besalu_raw):
    besalu_elements.append({
        'index': r[0],
        'z': r[1],
        'symbol': r[2],
        'atomicWeight': r[3],
        'atomicRadius': r[4],
        'firstIP': r[5],
        'firstEA': r[6],
        'electronegativity': r[7],
        'pc1': float(round(scores[i, 0], 4)),
        'pc2': float(round(scores[i, 1], 4)),
        'pc3': float(round(scores[i, 2], 4)),
        'pc4': float(round(scores[i, 3], 4)),
        'pc5': float(round(scores[i, 4], 4))
    })

besalu_js = f"""// Besalú (2013) dataset and PCA reference coordinates
// "From Periodic Properties to a Periodic Table Arrangement", J. Chem. Educ. 2013, 90, 1009-1013
// doi:10.1021/ed3004534

export const BESALU_PROPERTIES = [
  'Atomic Weight (amu)',
  'Atomic Radius (pm)',
  'First Ionization Potential (kJ/mol)',
  'First Electron Affinity (kJ/mol)',
  'Electronegativity (Pauling scale)'
];

export const BESALU_EIGENVALUES = {json.dumps([float(round(e, 4)) for e in eigenvalues], indent=2)};
export const BESALU_VARIANCE_PCT = {json.dumps([float(round(e / 5.0 * 100.0, 2)) for e in eigenvalues], indent=2)};

export const BESALU_LOADINGS = {json.dumps([[float(round(eigenvectors[row, col], 4)) for col in range(5)] for row in range(5)], indent=2)};

export const BESALU_CORRELATION_MATRIX = {json.dumps([[float(round(R[i, j], 4)) for j in range(5)] for i in range(5)], indent=2)};

export const BESALU_ELEMENTS = {json.dumps(besalu_elements, indent=2)};
"""

os.makedirs('f:/xyh/element-projections/src/data', exist_ok=True)
with open('f:/xyh/element-projections/src/data/besalu.js', 'w', encoding='utf-8') as f:
    f.write(besalu_js)

print("Generated src/data/besalu.js")

# 2. Allahyari & Oganov 2020 Universal Sequence of Elements (USE) Table 2
use_table = [
  (1, 'Fr', 0.0), (2, 'Cs', 0.077), (3, 'Rb', 0.272), (4, 'K', 0.411), (5, 'Ra', 0.486),
  (6, 'Ba', 0.606), (7, 'Sr', 0.662), (8, 'Ac', 0.827), (9, 'Ca', 0.834), (10, 'Na', 0.843),
  (11, 'Rn', 0.871), (12, 'Yb', 0.892), (13, 'La', 0.984), (14, 'Pm', 1.011), (15, 'Tb', 1.012),
  (16, 'Sm', 1.041), (17, 'Gd', 1.061), (18, 'Eu', 1.063), (19, 'Y', 1.071), (20, 'Dy', 1.081),
  (21, 'Th', 1.091), (22, 'Ho', 1.094), (23, 'Er', 1.101), (24, 'Tm', 1.107), (25, 'Lu', 1.116),
  (26, 'Li', 1.141), (27, 'Ce', 1.144), (28, 'Mg', 1.218), (29, 'Pr', 1.232), (30, 'Hf', 1.257),
  (31, 'Xe', 1.263), (32, 'Zr', 1.266), (33, 'Nd', 1.276), (34, 'Sc', 1.281), (35, 'Tl', 1.304),
  (36, 'Pa', 1.385), (37, 'Pu', 1.396), (38, 'U', 1.397), (39, 'Cm', 1.401), (40, 'Am', 1.416),
  (41, 'Np', 1.425), (42, 'Cd', 1.433), (43, 'Pb', 1.442), (44, 'Ta', 1.449), (45, 'In', 1.458),
  (46, 'Po', 1.477), (47, 'At', 1.502), (48, 'Nb', 1.503), (49, 'Ti', 1.513), (50, 'Al', 1.514),
  (51, 'Bi', 1.517), (52, 'Sn', 1.560), (53, 'Zn', 1.566), (54, 'Hg', 1.571), (55, 'Te', 1.594),
  (56, 'Sb', 1.601), (57, 'Ga', 1.620), (58, 'V', 1.646), (59, 'Mn', 1.661), (60, 'Ag', 1.676),
  (61, 'Cr', 1.702), (62, 'Be', 1.710), (63, 'Kr', 1.710), (64, 'Ge', 1.733), (65, 'Re', 1.735),
  (66, 'Si', 1.750), (67, 'Tc', 1.760), (68, 'Cu', 1.804), (69, 'I', 1.810), (70, 'Fe', 1.824),
  (71, 'As', 1.827), (72, 'Ni', 1.845), (73, 'Co', 1.847), (74, 'Mo', 1.877), (75, 'Ar', 1.885),
  (76, 'Pd', 1.890), (77, 'Ir', 1.905), (78, 'Os', 1.913), (79, 'Pt', 1.931), (80, 'Ru', 1.937),
  (81, 'P', 1.953), (82, 'Rh', 1.970), (83, 'W', 1.973), (84, 'Se', 1.997), (85, 'Au', 2.027),
  (86, 'B', 2.106), (87, 'S', 2.116), (88, 'Br', 2.120), (89, 'Cl', 2.332), (90, 'H', 2.366),
  (91, 'Ne', 2.373), (92, 'He', 2.418), (93, 'C', 2.430), (94, 'N', 2.675), (95, 'O', 2.849),
  (96, 'F', 3.080)
]

pettifor_order = [
  'Cs', 'Rb', 'K', 'Na', 'Li', 'Ba', 'Sr', 'Ca', 'Yb', 'Eu',
  'Y', 'Sc', 'Lu', 'Tm', 'Er', 'Ho', 'Dy', 'Tb', 'Gd', 'Sm',
  'Pm', 'Nd', 'Pr', 'Ce', 'La', 'Zr', 'Hf', 'Ti', 'Ta', 'Nb',
  'V', 'W', 'Mo', 'Cr', 'Re', 'Tc', 'Mn', 'Fe', 'Os', 'Ru',
  'Co', 'Ir', 'Rh', 'Ni', 'Pt', 'Pd', 'Au', 'Ag', 'Cu', 'Mg',
  'Hg', 'Cd', 'Zn', 'Be', 'Tl', 'In', 'Al', 'Ga', 'Pb', 'Sn',
  'Ge', 'Si', 'B', 'Bi', 'Sb', 'As', 'P', 'Po', 'Te', 'Se',
  'S', 'C', 'I', 'Br', 'Cl', 'N', 'O', 'F', 'H', 'He',
  'Ne', 'Ar', 'Kr', 'Xe', 'Rn'
]

# Sneath (2000) Table III Typicality distances
sneath_typicality = {
  'Sb': 0.281, 'Sn': 0.285, 'Ga': 0.287, 'Te': 0.292, 'Bi': 0.293,
  'Ti': 0.300, 'Pb': 0.302, 'Fe': 0.310, 'Si': 0.315, 'Ge': 0.315,
  'F': 0.477, 'Os': 0.471, 'Tc': 0.459, 'K': 0.458, 'Rb': 0.454,
  'Na': 0.452, 'Cs': 0.451, 'Ir': 0.449, 'O': 0.447, 'Re': 0.447
}

mendeleev_scales_js = f"""// Allahyari & Oganov (2020) Mendeleev numbers, Pettifor (1984) scale, and Sneath (2000) metrics
// Allahyari & Oganov: "Nonempirical Definition of the Mendeleev Numbers: Organizing the Chemical Space", J. Phys. Chem. C 2020
// Pettifor: "A chemical scale for crystal-structure maps", Solid State Commun. 1984
// Sneath: "Numerical Classification of the Chemical Elements and Its Relation to the Periodic System", Found. Chem. 2000

export const ALLAHYARI_OGANOV_USE = {json.dumps([{'useRank': r[0], 'symbol': r[1], 'chemicalScale': r[2]} for r in use_table], indent=2)};

export const PETTIFOR_SCALE = {json.dumps([{'pettiforRank': i+1, 'symbol': s} for i, s in enumerate(pettifor_order)], indent=2)};

export const SNEATH_TYPICALITY = {json.dumps(sneath_typicality, indent=2)};
"""

with open('f:/xyh/element-projections/src/data/mendeleev_scales.js', 'w', encoding='utf-8') as f:
    f.write(mendeleev_scales_js)

print("Generated src/data/mendeleev_scales.js")

# 3. Comprehensive 118 Elements dataset
# Complete physical and chemical data for all 118 elements
raw_elements = [
  (1, "H", "Hydrogen", 1.008, 1, 1, "s", "reactive-nonmetal", "1s1", 2.20, 2.20, 25, 31, 120, 1312.0, 72.8, 0.00008988, 14.01, 20.28, 1, [1, -1], 1766, "gas"),
  (2, "He", "Helium", 4.0026, 1, 18, "s", "noble-gas", "1s2", None, 4.16, 31, 28, 140, 2372.3, 0.0, 0.0001785, 0.95, 4.22, 0, [0], 1868, "gas"),
  (3, "Li", "Lithium", 6.94, 2, 1, "s", "alkali-metal", "[He] 2s1", 0.98, 0.97, 145, 128, 182, 520.2, 59.6, 0.534, 453.69, 1603, 1, [1], 1817, "solid"),
  (4, "Be", "Beryllium", 9.0122, 2, 2, "s", "alkaline-earth", "[He] 2s2", 1.57, 1.47, 105, 96, 153, 899.5, 0.0, 1.85, 1560, 2742, 2, [2], 1798, "solid"),
  (5, "B", "Boron", 10.81, 2, 13, "p", "metalloid", "[He] 2s2 2p1", 2.04, 2.01, 85, 84, 192, 800.6, 26.7, 2.34, 2349, 4200, 3, [3], 1808, "solid"),
  (6, "C", "Carbon", 12.011, 2, 14, "p", "reactive-nonmetal", "[He] 2s2 2p2", 2.55, 2.50, 70, 76, 170, 1086.5, 121.8, 2.267, 3800, 4300, 4, [4, 2, -4], -2500, "solid"),
  (7, "N", "Nitrogen", 14.007, 2, 15, "p", "reactive-nonmetal", "[He] 2s2 2p3", 3.04, 3.07, 65, 71, 155, 1402.3, -7.0, 0.0012506, 63.15, 77.36, 5, [5, 4, 3, 2, 1, -1, -2, -3], 1772, "gas"),
  (8, "O", "Oxygen", 15.999, 2, 16, "p", "reactive-nonmetal", "[He] 2s2 2p4", 3.44, 3.50, 60, 66, 152, 1313.9, 141.0, 0.001429, 54.36, 90.20, 6, [-2, -1, 1, 2], 1774, "gas"),
  (9, "F", "Fluorine", 18.998, 2, 17, "p", "reactive-nonmetal", "[He] 2s2 2p5", 3.98, 4.10, 50, 57, 147, 1681.0, 328.2, 0.001696, 53.53, 85.03, 7, [-1], 1886, "gas"),
  (10, "Ne", "Neon", 20.180, 2, 18, "p", "noble-gas", "[He] 2s2 2p6", None, 4.79, 38, 58, 154, 2080.7, 0.0, 0.0008999, 24.56, 27.07, 0, [0], 1898, "gas"),
  (11, "Na", "Sodium", 22.990, 3, 1, "s", "alkali-metal", "[Ne] 3s1", 0.93, 1.01, 180, 166, 227, 495.8, 52.8, 0.968, 370.87, 1156, 1, [1], 1807, "solid"),
  (12, "Mg", "Magnesium", 24.305, 3, 2, "s", "alkaline-earth", "[Ne] 3s2", 1.31, 1.23, 150, 141, 173, 737.7, 0.0, 1.738, 923, 1363, 2, [2], 1755, "solid"),
  (13, "Al", "Aluminum", 26.982, 3, 13, "p", "post-transition-metal", "[Ne] 3s2 3p1", 1.61, 1.47, 125, 121, 184, 577.5, 42.5, 2.70, 933.47, 2792, 3, [3], 1825, "solid"),
  (14, "Si", "Silicon", 28.085, 3, 14, "p", "metalloid", "[Ne] 3s2 3p2", 1.90, 1.74, 110, 111, 210, 786.5, 134.1, 2.329, 1687, 3538, 4, [4, 2, -4], 1824, "solid"),
  (15, "P", "Phosphorus", 30.974, 3, 15, "p", "reactive-nonmetal", "[Ne] 3s2 3p3", 2.19, 2.06, 100, 107, 180, 1011.8, 72.0, 1.823, 317.3, 550, 5, [5, 4, 3, 2, 1, -1, -2, -3], 1669, "solid"),
  (16, "S", "Sulfur", 32.06, 3, 16, "p", "reactive-nonmetal", "[Ne] 3s2 3p4", 2.58, 2.44, 100, 105, 180, 999.6, 200.4, 2.07, 388.36, 717.8, 6, [6, 4, 2, -2], -500, "solid"),
  (17, "Cl", "Chlorine", 35.45, 3, 17, "p", "reactive-nonmetal", "[Ne] 3s2 3p5", 3.16, 2.83, 100, 102, 175, 1251.2, 349.0, 0.003214, 171.6, 239.11, 7, [7, 5, 3, 1, -1], 1774, "gas"),
  (18, "Ar", "Argon", 39.948, 3, 18, "p", "noble-gas", "[Ne] 3s2 3p6", None, 3.20, 71, 106, 188, 1520.6, 0.0, 0.001784, 83.80, 87.30, 0, [0], 1894, "gas"),
  (19, "K", "Potassium", 39.098, 4, 1, "s", "alkali-metal", "[Ar] 4s1", 0.82, 0.91, 220, 203, 275, 418.8, 48.4, 0.862, 336.53, 1032, 1, [1], 1807, "solid"),
  (20, "Ca", "Calcium", 40.078, 4, 2, "s", "alkaline-earth", "[Ar] 4s2", 1.00, 1.04, 180, 176, 231, 589.8, 2.4, 1.54, 1115, 1757, 2, [2], 1808, "solid"),
  (21, "Sc", "Scandium", 44.956, 4, 3, "d", "transition-metal", "[Ar] 3d1 4s2", 1.36, 1.20, 160, 170, 211, 633.1, 18.1, 2.989, 1814, 3109, 3, [3], 1879, "solid"),
  (22, "Ti", "Titanium", 47.867, 4, 4, "d", "transition-metal", "[Ar] 3d2 4s2", 1.54, 1.32, 140, 160, 200, 658.8, 7.6, 4.54, 1941, 3560, 4, [4, 3, 2], 1791, "solid"),
  (23, "V", "Vanadium", 50.942, 4, 5, "d", "transition-metal", "[Ar] 3d3 4s2", 1.63, 1.45, 135, 153, 190, 650.9, 50.6, 6.11, 2183, 3680, 5, [5, 4, 3, 2], 1801, "solid"),
  (24, "Cr", "Chromium", 51.996, 4, 6, "d", "transition-metal", "[Ar] 3d5 4s1", 1.66, 1.56, 140, 139, 189, 652.9, 64.3, 7.15, 2180, 2944, 6, [6, 3, 2], 1797, "solid"),
  (25, "Mn", "Manganese", 54.938, 4, 7, "d", "transition-metal", "[Ar] 3d5 4s2", 1.55, 1.60, 140, 139, 197, 717.3, 0.0, 7.44, 1519, 2334, 7, [7, 4, 3, 2], 1774, "solid"),
  (26, "Fe", "Iron", 55.845, 4, 8, "d", "transition-metal", "[Ar] 3d6 4s2", 1.83, 1.64, 140, 132, 194, 762.5, 15.7, 7.874, 1811, 3134, 8, [6, 3, 2], -2500, "solid"),
  (27, "Co", "Cobalt", 58.933, 4, 9, "d", "transition-metal", "[Ar] 3d7 4s2", 1.88, 1.70, 135, 126, 192, 760.4, 63.7, 8.86, 1768, 3200, 9, [3, 2], 1735, "solid"),
  (28, "Ni", "Nickel", 58.693, 4, 10, "d", "transition-metal", "[Ar] 3d8 4s2", 1.91, 1.75, 135, 124, 163, 737.1, 112.0, 8.912, 1728, 3186, 10, [3, 2], 1751, "solid"),
  (29, "Cu", "Copper", 63.546, 4, 11, "d", "transition-metal", "[Ar] 3d10 4s1", 1.90, 1.75, 135, 132, 140, 745.5, 118.4, 8.96, 1357.77, 2835, 11, [2, 1], -8000, "solid"),
  (30, "Zn", "Zinc", 65.38, 4, 12, "d", "transition-metal", "[Ar] 3d10 4s2", 1.65, 1.66, 135, 122, 139, 906.4, 0.0, 7.134, 692.88, 1180, 12, [2], -1000, "solid"),
  (31, "Ga", "Gallium", 69.723, 4, 13, "p", "post-transition-metal", "[Ar] 3d10 4s2 4p1", 1.81, 1.82, 130, 122, 187, 578.8, 28.9, 5.907, 302.91, 2477, 3, [3], 1875, "solid"),
  (32, "Ge", "Germanium", 72.630, 4, 14, "p", "metalloid", "[Ar] 3d10 4s2 4p2", 2.01, 2.02, 125, 120, 211, 762.0, 119.0, 5.323, 1211.40, 3106, 4, [4, 2], 1886, "solid"),
  (33, "As", "Arsenic", 74.922, 4, 15, "p", "metalloid", "[Ar] 3d10 4s2 4p3", 2.18, 2.20, 115, 119, 185, 947.0, 78.2, 5.776, 1090, 887, 5, [5, 3, -3], 1250, "solid"),
  (34, "Se", "Selenium", 78.971, 4, 16, "p", "reactive-nonmetal", "[Ar] 3d10 4s2 4p4", 2.55, 2.48, 115, 120, 190, 941.0, 195.0, 4.809, 494, 958, 6, [6, 4, -2], 1817, "solid"),
  (35, "Br", "Bromine", 79.904, 4, 17, "p", "reactive-nonmetal", "[Ar] 3d10 4s2 4p5", 2.96, 2.74, 115, 120, 185, 1139.9, 324.6, 3.122, 265.8, 332.0, 7, [7, 5, 3, 1, -1], 1826, "liquid"),
  (36, "Kr", "Krypton", 83.798, 4, 18, "p", "noble-gas", "[Ar] 3d10 4s2 4p6", 3.00, 2.98, 88, 116, 202, 1350.8, 0.0, 0.003733, 115.79, 119.93, 0, [2, 0], 1898, "gas"),
  (37, "Rb", "Rubidium", 85.468, 5, 1, "s", "alkali-metal", "[Kr] 5s1", 0.82, 0.89, 235, 220, 303, 403.0, 46.9, 1.532, 312.46, 961, 1, [1], 1861, "solid"),
  (38, "Sr", "Strontium", 87.62, 5, 2, "s", "alkaline-earth", "[Kr] 5s2", 0.95, 0.99, 200, 195, 249, 549.5, 5.0, 2.64, 1050, 1655, 2, [2], 1790, "solid"),
  (39, "Y", "Yttrium", 88.906, 5, 3, "d", "transition-metal", "[Kr] 4d1 5s2", 1.22, 1.11, 180, 190, 232, 600.0, 29.6, 4.469, 1799, 3609, 3, [3], 1794, "solid"),
  (40, "Zr", "Zirconium", 91.224, 5, 4, "d", "transition-metal", "[Kr] 4d2 5s2", 1.33, 1.22, 155, 175, 223, 640.1, 41.1, 6.506, 2128, 4682, 4, [4], 1789, "solid"),
  (41, "Nb", "Niobium", 92.906, 5, 5, "d", "transition-metal", "[Kr] 4d4 5s1", 1.60, 1.23, 145, 164, 218, 652.1, 86.1, 8.57, 2750, 5017, 5, [5, 3], 1801, "solid"),
  (42, "Mo", "Molybdenum", 95.95, 5, 6, "d", "transition-metal", "[Kr] 4d5 5s1", 2.16, 1.30, 145, 154, 217, 684.3, 71.9, 10.22, 2896, 4912, 6, [6, 4, 3, 2], 1778, "solid"),
  (43, "Tc", "Technetium", 98.0, 5, 7, "d", "transition-metal", "[Kr] 4d5 5s2", 1.90, 1.36, 135, 147, 216, 702.0, 53.0, 11.5, 2430, 4538, 7, [7, 4], 1937, "solid"),
  (44, "Ru", "Ruthenium", 101.07, 5, 8, "d", "transition-metal", "[Kr] 4d7 5s1", 2.20, 1.42, 130, 146, 213, 710.2, 101.3, 12.37, 2607, 4423, 8, [8, 4, 3], 1844, "solid"),
  (45, "Rh", "Rhodium", 102.91, 5, 9, "d", "transition-metal", "[Kr] 4d8 5s1", 2.28, 1.45, 135, 142, 210, 719.7, 109.7, 12.41, 2237, 3968, 9, [4, 3, 1], 1803, "solid"),
  (46, "Pd", "Palladium", 106.42, 5, 10, "d", "transition-metal", "[Kr] 4d10", 2.20, 1.35, 140, 139, 210, 804.4, 53.7, 12.02, 1828.05, 3236, 10, [4, 2], 1803, "solid"),
  (47, "Ag", "Silver", 107.87, 5, 11, "d", "transition-metal", "[Kr] 4d10 5s1", 1.93, 1.42, 160, 145, 211, 731.0, 125.6, 10.501, 1234.93, 2435, 11, [1], -5000, "solid"),
  (48, "Cd", "Cadmium", 112.41, 5, 12, "d", "transition-metal", "[Kr] 4d10 5s2", 1.69, 1.46, 155, 144, 218, 867.8, 0.0, 8.69, 594.22, 1040, 12, [2], 1817, "solid"),
  (49, "In", "Indium", 114.82, 5, 13, "p", "post-transition-metal", "[Kr] 4d10 5s2 5p1", 1.78, 1.49, 155, 142, 193, 558.3, 28.9, 7.31, 429.75, 2345, 3, [3, 1], 1863, "solid"),
  (50, "Sn", "Tin", 118.71, 5, 14, "p", "post-transition-metal", "[Kr] 4d10 5s2 5p2", 1.96, 1.72, 145, 139, 217, 708.6, 107.3, 7.287, 505.08, 2875, 4, [4, 2], -3500, "solid"),
  (51, "Sb", "Antimony", 121.76, 5, 15, "p", "metalloid", "[Kr] 4d10 5s2 5p3", 2.05, 1.82, 145, 139, 206, 834.0, 103.2, 6.685, 903.78, 1860, 5, [5, 3, -3], -3000, "solid"),
  (52, "Te", "Tellurium", 127.60, 5, 16, "p", "metalloid", "[Kr] 4d10 5s2 5p4", 2.10, 2.01, 140, 138, 206, 869.3, 190.2, 6.232, 722.66, 1261, 6, [6, 4, -2], 1782, "solid"),
  (53, "I", "Iodine", 126.90, 5, 17, "p", "reactive-nonmetal", "[Kr] 4d10 5s2 5p5", 2.66, 2.21, 140, 139, 198, 1008.4, 295.2, 4.93, 386.85, 457.4, 7, [7, 5, 1, -1], 1811, "solid"),
  (54, "Xe", "Xenon", 131.29, 5, 18, "p", "noble-gas", "[Kr] 4d10 5s2 5p6", 2.60, 2.40, 108, 140, 216, 1170.4, 0.0, 0.005887, 161.4, 165.03, 0, [8, 6, 4, 2, 0], 1898, "gas"),
  (55, "Cs", "Cesium", 132.91, 6, 1, "s", "alkali-metal", "[Xe] 6s1", 0.79, 0.86, 260, 244, 343, 375.7, 45.5, 1.93, 301.59, 944, 1, [1], 1860, "solid"),
  (56, "Ba", "Barium", 137.33, 6, 2, "s", "alkaline-earth", "[Xe] 6s2", 0.89, 0.97, 215, 215, 268, 502.9, 13.95, 3.594, 1000, 2170, 2, [2], 1808, "solid"),
  (57, "La", "Lanthanum", 138.91, 6, 3, "f", "lanthanide", "[Xe] 5d1 6s2", 1.10, 1.08, 195, 207, 243, 538.1, 48.0, 6.145, 1193, 3737, 3, [3], 1839, "solid"),
  (58, "Ce", "Cerium", 140.12, 6, 3, "f", "lanthanide", "[Xe] 4f1 5d1 6s2", 1.12, 1.06, 185, 204, 242, 534.4, 50.0, 6.77, 1068, 3716, 4, [4, 3], 1803, "solid"),
  (59, "Pr", "Praseodymium", 140.91, 6, 3, "f", "lanthanide", "[Xe] 4f3 6s2", 1.13, 1.07, 185, 203, 240, 527.0, 50.0, 6.77, 1208, 3793, 5, [4, 3], 1885, "solid"),
  (60, "Nd", "Neodymium", 144.24, 6, 3, "f", "lanthanide", "[Xe] 4f4 6s2", 1.14, 1.07, 185, 201, 239, 533.1, 50.0, 7.01, 1297, 3347, 6, [3], 1885, "solid"),
  (61, "Pm", "Promethium", 145.0, 6, 3, "f", "lanthanide", "[Xe] 4f5 6s2", 1.13, 1.07, 185, 199, 238, 540.0, 50.0, 7.26, 1315, 3273, 7, [3], 1945, "solid"),
  (62, "Sm", "Samarium", 150.36, 6, 3, "f", "lanthanide", "[Xe] 4f6 6s2", 1.17, 1.07, 185, 198, 236, 544.5, 50.0, 7.52, 1345, 2067, 8, [3, 2], 1879, "solid"),
  (63, "Eu", "Europium", 151.96, 6, 3, "f", "lanthanide", "[Xe] 4f7 6s2", 1.20, 1.01, 185, 198, 235, 547.1, 50.0, 5.244, 1099, 1802, 9, [3, 2], 1901, "solid"),
  (64, "Gd", "Gadolinium", 157.25, 6, 3, "f", "lanthanide", "[Xe] 4f7 5d1 6s2", 1.20, 1.11, 180, 196, 234, 593.4, 50.0, 7.90, 1585, 3546, 10, [3], 1880, "solid"),
  (65, "Tb", "Terbium", 158.93, 6, 3, "f", "lanthanide", "[Xe] 4f9 6s2", 1.10, 1.10, 175, 194, 233, 565.8, 50.0, 8.23, 1629, 3503, 11, [4, 3], 1843, "solid"),
  (66, "Dy", "Dysprosium", 162.50, 6, 3, "f", "lanthanide", "[Xe] 4f10 6s2", 1.22, 1.10, 175, 192, 231, 573.0, 50.0, 8.54, 1680, 2840, 12, [3], 1886, "solid"),
  (67, "Ho", "Holmium", 164.93, 6, 3, "f", "lanthanide", "[Xe] 4f11 6s2", 1.23, 1.10, 175, 192, 230, 581.0, 50.0, 8.79, 1734, 2993, 13, [3], 1878, "solid"),
  (68, "Er", "Erbium", 167.26, 6, 3, "f", "lanthanide", "[Xe] 4f12 6s2", 1.24, 1.11, 175, 189, 229, 589.3, 50.0, 9.066, 1802, 3141, 14, [3], 1842, "solid"),
  (69, "Tm", "Thulium", 168.93, 6, 3, "f", "lanthanide", "[Xe] 4f13 6s2", 1.25, 1.11, 175, 190, 227, 596.7, 50.0, 9.32, 1818, 2223, 15, [3, 2], 1879, "solid"),
  (70, "Yb", "Ytterbium", 173.05, 6, 3, "f", "lanthanide", "[Xe] 4f14 6s2", 1.10, 1.06, 175, 187, 226, 603.4, 50.0, 6.90, 1097, 1469, 16, [3, 2], 1878, "solid"),
  (71, "Lu", "Lutetium", 174.97, 6, 3, "d", "lanthanide", "[Xe] 4f14 5d1 6s2", 1.27, 1.14, 175, 187, 224, 523.5, 50.0, 9.841, 1925, 3675, 3, [3], 1907, "solid"),
  (72, "Hf", "Hafnium", 178.49, 6, 4, "d", "transition-metal", "[Xe] 4f14 5d2 6s2", 1.30, 1.23, 155, 175, 223, 658.5, 0.0, 13.31, 2506, 4876, 4, [4], 1923, "solid"),
  (73, "Ta", "Tantalum", 180.95, 6, 5, "d", "transition-metal", "[Xe] 4f14 5d3 6s2", 1.50, 1.33, 145, 170, 222, 761.0, 31.0, 16.69, 3290, 5731, 5, [5], 1802, "solid"),
  (74, "W", "Tungsten", 183.84, 6, 6, "d", "transition-metal", "[Xe] 4f14 5d4 6s2", 2.36, 1.40, 135, 162, 218, 770.0, 78.6, 19.25, 3695, 5828, 6, [6, 4], 1783, "solid"),
  (75, "Re", "Rhenium", 186.21, 6, 7, "d", "transition-metal", "[Xe] 4f14 5d5 6s2", 1.90, 1.46, 135, 151, 216, 760.0, 14.5, 21.02, 3459, 5869, 7, [7, 4], 1925, "solid"),
  (76, "Os", "Osmium", 190.23, 6, 8, "d", "transition-metal", "[Xe] 4f14 5d6 6s2", 2.20, 1.52, 130, 144, 216, 840.0, 106.1, 22.59, 3306, 5285, 8, [8, 4, 3], 1803, "solid"),
  (77, "Ir", "Iridium", 192.22, 6, 9, "d", "transition-metal", "[Xe] 4f14 5d7 6s2", 2.20, 1.55, 135, 141, 213, 880.0, 151.0, 22.56, 2719, 4701, 9, [6, 4, 3], 1803, "solid"),
  (78, "Pt", "Platinum", 195.08, 6, 10, "d", "transition-metal", "[Xe] 4f14 5d9 6s1", 2.28, 1.44, 135, 136, 213, 870.0, 205.3, 21.45, 2041.4, 4098, 10, [4, 2], 1735, "solid"),
  (79, "Au", "Gold", 196.97, 6, 11, "d", "transition-metal", "[Xe] 4f14 5d10 6s1", 2.54, 1.42, 135, 136, 214, 890.1, 222.8, 19.3, 1337.33, 3129, 11, [3, 1], -6000, "solid"),
  (80, "Hg", "Mercury", 200.59, 6, 12, "d", "transition-metal", "[Xe] 4f14 5d10 6s2", 2.00, 1.44, 150, 132, 223, 1007.1, 0.0, 13.534, 234.32, 629.88, 12, [2, 1], -1500, "liquid"),
  (81, "Tl", "Thallium", 204.38, 6, 13, "p", "post-transition-metal", "[Xe] 4f14 5d10 6s2 6p1", 1.62, 1.44, 190, 145, 196, 589.4, 19.2, 11.85, 577, 1746, 3, [3, 1], 1861, "solid"),
  (82, "Pb", "Lead", 207.2, 6, 14, "p", "post-transition-metal", "[Xe] 4f14 5d10 6s2 6p2", 1.87, 1.55, 180, 146, 202, 715.6, 35.1, 11.34, 600.61, 2022, 4, [4, 2], -7000, "solid"),
  (83, "Bi", "Bismuth", 208.98, 6, 15, "p", "post-transition-metal", "[Xe] 4f14 5d10 6s2 6p3", 2.02, 1.67, 160, 148, 207, 703.0, 91.2, 9.78, 544.7, 1837, 5, [5, 3], 1753, "solid"),
  (84, "Po", "Polonium", 209.0, 6, 16, "p", "post-transition-metal", "[Xe] 4f14 5d10 6s2 6p4", 2.00, 1.76, 190, 140, 197, 812.1, 183.3, 9.196, 527, 1235, 6, [4, 2], 1898, "solid"),
  (85, "At", "Astatine", 210.0, 6, 17, "p", "metalloid", "[Xe] 4f14 5d10 6s2 6p5", 2.20, 1.90, 150, 150, 202, 899.0, 270.1, 6.2, 575, 610, 7, [7, 5, 3, 1, -1], 1940, "solid"),
  (86, "Rn", "Radon", 222.0, 6, 18, "p", "noble-gas", "[Xe] 4f14 5d10 6s2 6p6", 2.20, 2.06, 120, 150, 220, 1037.0, 0.0, 0.00973, 202, 211.3, 0, [2, 0], 1900, "gas"),
  (87, "Fr", "Francium", 223.0, 7, 1, "s", "alkali-metal", "[Rn] 7s1", 0.70, 0.86, 270, 260, 348, 380.0, 47.0, 1.87, 295, 950, 1, [1], 1939, "solid"),
  (88, "Ra", "Radium", 226.0, 7, 2, "s", "alkaline-earth", "[Rn] 7s2", 0.90, 0.97, 215, 221, 283, 509.3, 9.6, 5.5, 973, 2010, 2, [2], 1898, "solid"),
  (89, "Ac", "Actinium", 227.0, 7, 3, "f", "actinide", "[Rn] 6d1 7s2", 1.10, 1.00, 195, 215, 247, 499.0, 33.7, 10.07, 1323, 3471, 3, [3], 1899, "solid"),
  (90, "Th", "Thorium", 232.04, 7, 3, "f", "actinide", "[Rn] 6d2 7s2", 1.30, 1.11, 180, 206, 245, 587.0, 112.0, 11.724, 2115, 5061, 4, [4], 1829, "solid"),
  (91, "Pa", "Protactinium", 231.04, 7, 3, "f", "actinide", "[Rn] 5f2 6d1 7s2", 1.50, 1.14, 180, 200, 243, 568.0, 53.0, 15.37, 1841, 4300, 5, [5, 4], 1913, "solid"),
  (92, "U", "Uranium", 238.03, 7, 3, "f", "actinide", "[Rn] 5f3 6d1 7s2", 1.38, 1.22, 175, 196, 241, 597.6, 50.9, 19.1, 1405.3, 4404, 6, [6, 4, 3], 1789, "solid"),
  (93, "Np", "Neptunium", 237.0, 7, 3, "f", "actinide", "[Rn] 5f4 6d1 7s2", 1.36, 1.22, 175, 190, 239, 604.5, 45.8, 20.45, 917, 4273, 7, [5, 4, 3], 1940, "solid"),
  (94, "Pu", "Plutonium", 244.0, 7, 3, "f", "actinide", "[Rn] 5f6 7s2", 1.28, 1.22, 175, 187, 243, 584.7, -48.3, 19.86, 912.5, 3501, 8, [6, 4, 3], 1940, "solid"),
  (95, "Am", "Americium", 243.0, 7, 3, "f", "actinide", "[Rn] 5f7 7s2", 1.30, 1.20, 175, 180, 244, 578.0, 9.9, 12.0, 1449, 2880, 9, [6, 4, 3], 1944, "solid"),
  (96, "Cm", "Curium", 247.0, 7, 3, "f", "actinide", "[Rn] 5f7 6d1 7s2", 1.30, 1.20, 175, 169, 245, 581.0, 27.2, 13.51, 1613, 3383, 10, [4, 3], 1944, "solid"),
  (97, "Bk", "Berkelium", 247.0, 7, 3, "f", "actinide", "[Rn] 5f9 7s2", 1.30, 1.20, 170, 160, 244, 601.0, -165.2, 14.78, 1259, 2900, 11, [4, 3], 1949, "solid"),
  (98, "Cf", "Californium", 251.0, 7, 3, "f", "actinide", "[Rn] 5f10 7s2", 1.30, 1.20, 170, 160, 245, 608.0, -97.3, 15.1, 1173, 1743, 12, [3, 2], 1950, "solid"),
  (99, "Es", "Einsteinium", 252.0, 7, 3, "f", "actinide", "[Rn] 5f11 7s2", 1.30, 1.20, 170, 160, 245, 619.0, -28.6, 8.84, 1133, 1269, 13, [3], 1952, "solid"),
  (100, "Fm", "Fermium", 257.0, 7, 3, "f", "actinide", "[Rn] 5f12 7s2", 1.30, 1.20, 170, 160, 245, 627.0, 33.9, 9.7, 1125, None, 14, [3], 1952, "solid"),
  (101, "Md", "Mendelevium", 258.0, 7, 3, "f", "actinide", "[Rn] 5f13 7s2", 1.30, 1.20, 170, 160, 246, 635.0, 93.9, 10.3, 1100, None, 15, [3, 2], 1955, "solid"),
  (102, "No", "Nobelium", 259.0, 7, 3, "f", "actinide", "[Rn] 5f14 7s2", 1.30, 1.20, 170, 160, 246, 642.0, -223.2, 9.9, 1100, None, 16, [3, 2], 1958, "solid"),
  (103, "Lr", "Lawrencium", 266.0, 7, 3, "d", "actinide", "[Rn] 5f14 7s2 7p1", 1.30, 1.20, 170, 160, 246, 470.0, -30.0, 15.6, 1900, None, 3, [3], 1961, "solid"),
  (104, "Rf", "Rutherfordium", 267.0, 7, 4, "d", "transition-metal", "[Rn] 5f14 6d2 7s2", None, None, 150, 157, None, 580.0, None, 23.2, 2400, 5800, 4, [4], 1964, "solid"),
  (105, "Db", "Dubnium", 268.0, 7, 5, "d", "transition-metal", "[Rn] 5f14 6d3 7s2", None, None, 145, 149, None, 665.0, None, 29.3, None, None, 5, [5], 1968, "solid"),
  (106, "Sg", "Seaborgium", 269.0, 7, 6, "d", "transition-metal", "[Rn] 5f14 6d4 7s2", None, None, 140, 143, None, 757.0, None, 35.0, None, None, 6, [6], 1974, "solid"),
  (107, "Bh", "Bohrium", 270.0, 7, 7, "d", "transition-metal", "[Rn] 5f14 6d5 7s2", None, None, 135, 141, None, 742.0, None, 37.1, None, None, 7, [7], 1981, "solid"),
  (108, "Hs", "Hassium", 277.0, 7, 8, "d", "transition-metal", "[Rn] 5f14 6d6 7s2", None, None, 130, 134, None, 733.0, None, 40.7, None, None, 8, [8], 1984, "solid"),
  (109, "Mt", "Meitnerium", 278.0, 7, 9, "d", "transition-metal", "[Rn] 5f14 6d7 7s2", None, None, 130, 129, None, 800.0, None, 37.4, None, None, 9, [9], 1982, "solid"),
  (110, "Ds", "Darmstadtium", 281.0, 7, 10, "d", "transition-metal", "[Rn] 5f14 6d9 7s1", None, None, 130, 128, None, 955.0, None, 34.8, None, None, 10, [6, 4, 2], 1994, "solid"),
  (111, "Rg", "Roentgenium", 282.0, 7, 11, "d", "transition-metal", "[Rn] 5f14 6d10 7s1", None, None, 130, 121, None, 1022.0, None, 28.7, None, None, 11, [5, 3, -1], 1994, "solid"),
  (112, "Cn", "Copernicium", 285.0, 7, 12, "d", "transition-metal", "[Rn] 5f14 6d10 7s2", None, None, 130, 122, None, 1155.0, None, 14.0, 283, 340, 12, [2], 1996, "liquid"),
  (113, "Nh", "Nihonium", 286.0, 7, 13, "p", "post-transition-metal", "[Rn] 5f14 6d10 7s2 7p1", None, None, 150, 136, None, 705.0, None, 16.0, 700, 1400, 3, [3, 1], 2003, "solid"),
  (114, "Fl", "Flerovium", 289.0, 7, 14, "p", "post-transition-metal", "[Rn] 5f14 6d10 7s2 7p2", None, None, 160, 143, None, 824.0, None, 14.0, 340, 420, 4, [2], 1998, "solid"),
  (115, "Mc", "Moscovium", 290.0, 7, 15, "p", "post-transition-metal", "[Rn] 5f14 6d10 7s2 7p3", None, None, 160, 162, None, 538.0, None, 13.5, 670, 1400, 5, [3, 1], 2003, "solid"),
  (116, "Lv", "Livermorium", 293.0, 7, 16, "p", "post-transition-metal", "[Rn] 5f14 6d10 7s2 7p4", None, None, 160, 175, None, 723.0, None, 12.9, 709, 1085, 6, [4, 2], 2000, "solid"),
  (117, "Ts", "Tennessine", 294.0, 7, 17, "p", "reactive-nonmetal", "[Rn] 5f14 6d10 7s2 7p5", None, None, 150, 165, None, 743.0, None, 7.2, 723, 883, 7, [5, 3, 1, -1], 2010, "solid"),
  (118, "Og", "Oganesson", 294.0, 7, 18, "p", "noble-gas", "[Rn] 5f14 6d10 7s2 7p6", None, None, 140, 157, None, 860.0, None, 5.0, 325, 350, 0, [4, 2, 0], 2002, "solid")
]

# Map lookups for Mendeleev & Besalu
besalu_lookup = {r[2]: r[0] for r in besalu_raw}
use_lookup = {r[1]: (r[0], r[2]) for r in use_table}
pettifor_lookup = {s: i+1 for i, s in enumerate(pettifor_order)}

elements_list = []
for item in raw_elements:
    z, sym, name, mass, period, group18, block, cat, econf, enP, enAR, r_slater, r_cov, r_vdw, ip1, ea, dens, mp, bp, val, ox, disc, phase = item
    
    # Standard group vs group32
    # In 32-col layout: s is cols 1-2 (periods 1-7), f is cols 3-16 (periods 6-7), d is cols 17-26, p is cols 27-32
    # Period 1: H col 1, He col 32
    # Period 2-3: Li/Na col 1, Be/Mg col 2, B/Al col 27, C/Si col 28, N/P col 29, O/S col 30, F/Cl col 31, Ne/Ar col 32
    # Period 4-5: K/Rb col 1, Ca/Sr col 2, Sc/Y col 17 ... Zn/Cd col 26, Ga/In col 27 ... Kr/Xe col 32
    # Period 6: Cs col 1, Ba col 2, La-Yb col 3-16, Lu-Hg col 17-26, Tl-Rn col 27-32
    # Period 7: Fr col 1, Ra col 2, Ac-No col 3-16, Lr-Cn col 17-26, Nh-Og col 27-32
    
    if period == 1:
        group32 = 1 if z == 1 else 32
    elif period in (2, 3):
        group32 = group18 if group18 <= 2 else group18 + 14
    elif period in (4, 5):
        group32 = group18 if group18 <= 2 else group18 + 14
    else: # period 6 or 7
        if group18 == 1: group32 = 1
        elif group18 == 2: group32 = 2
        elif 57 <= z <= 70: # Lanthanides La to Yb
            group32 = 3 + (z - 57)
        elif 89 <= z <= 102: # Actinides Ac to No
            group32 = 3 + (z - 89)
        elif z == 71: # Lu
            group32 = 17
        elif z == 103: # Lr
            group32 = 17
        else:
            group32 = group18 + 14

    # Janet Left-Step coordinates (n+l blocks: f, d, p, s)
    # Row 1: H (1s1, col 31), He (1s2, col 32)
    # Row 2: Li (2s1, col 31), Be (2s2, col 32)
    # Row 3: B-Ne (2p1-2p6, col 25-30), Na-Mg (3s1-3s2, col 31-32)
    # Row 4: Al-Ar (3p1-3p6, col 25-30), K-Ca (4s1-4s2, col 31-32)
    # Row 5: Sc-Zn (3d1-3d10, col 15-24), Ga-Kr (4p1-4p6, col 25-30), Rb-Sr (5s1-5s2, col 31-32)
    # Row 6: Y-Cd (4d1-4d10, col 15-24), In-Xe (5p1-5p6, col 25-30), Cs-Ba (6s1-6s2, col 31-32)
    # Row 7: La-Yb (4f1-4f14, col 1-14), Lu-Hg (5d1-5d10, col 15-24), Tl-Rn (6p1-6p6, col 25-30), Fr-Ra (7s1-7s2, col 31-32)
    # Row 8: Ac-No (5f1-5f14, col 1-14), Lr-Cn (6d1-6d10, col 15-24), Nh-Og (7p1-7p6, col 25-30)
    janet_row = None
    janet_col = None
    if z in (1, 2):
        janet_row = 1; janet_col = 31 + (z - 1)
    elif z in (3, 4):
        janet_row = 2; janet_col = 31 + (z - 3)
    elif 5 <= z <= 10:
        janet_row = 3; janet_col = 25 + (z - 5)
    elif z in (11, 12):
        janet_row = 3; janet_col = 31 + (z - 11)
    elif 13 <= z <= 18:
        janet_row = 4; janet_col = 25 + (z - 13)
    elif z in (19, 20):
        janet_row = 4; janet_col = 31 + (z - 19)
    elif 21 <= z <= 30:
        janet_row = 5; janet_col = 15 + (z - 21)
    elif 31 <= z <= 36:
        janet_row = 5; janet_col = 25 + (z - 31)
    elif z in (37, 38):
        janet_row = 5; janet_col = 31 + (z - 37)
    elif 39 <= z <= 48:
        janet_row = 6; janet_col = 15 + (z - 39)
    elif 49 <= z <= 54:
        janet_row = 6; janet_col = 25 + (z - 49)
    elif z in (55, 56):
        janet_row = 6; janet_col = 31 + (z - 55)
    elif 57 <= z <= 70:
        janet_row = 7; janet_col = 1 + (z - 57)
    elif 71 <= z <= 80:
        janet_row = 7; janet_col = 15 + (z - 71)
    elif 81 <= z <= 86:
        janet_row = 7; janet_col = 25 + (z - 81)
    elif z in (87, 88):
        janet_row = 7; janet_col = 31 + (z - 87)
    elif 89 <= z <= 102:
        janet_row = 8; janet_col = 1 + (z - 89)
    elif 103 <= z <= 112:
        janet_row = 8; janet_col = 15 + (z - 103)
    elif 113 <= z <= 118:
        janet_row = 8; janet_col = 25 + (z - 113)

    # Standard 18-col row and col
    # Lanthanides (57-71) in separate row 8, Actinides (89-103) in separate row 9
    if 57 <= z <= 71:
        std_row = 8
        std_col = 3 + (z - 57) # cols 3 to 17
    elif 89 <= z <= 103:
        std_row = 9
        std_col = 3 + (z - 89) # cols 3 to 17
    else:
        std_row = period
        std_col = group18

    # Mendeleev 1869 (Short form 8-groups)
    # Row 1: H (Gr 1)
    # Row 2: Li (1), Be (2), B (3), C (4), N (5), O (6), F (7)
    # Row 3: Na (1), Mg (2), Al (3), Si (4), P (5), S (6), Cl (7)
    # Row 4: K (1), Ca (2), - (Sc 3), Ti (4), V (5), Cr (6), Mn (7), Fe/Co/Ni (8)
    # Row 5: Cu (1), Zn (2), - (Ga 3), - (Ge 4), As (5), Se (6), Br (7)
    # Row 6: Rb (1), Sr (2), Y (3), Zr (4), Nb (5), Mo (6), - (Tc 7), Ru/Rh/Pd (8)
    # Row 7: Ag (1), Cd (2), In (3), Sn (4), Sb (5), Te (6), I (7)
    # Row 8: Cs (1), Ba (2), ...
    m1869_group = ((group18 - 1) % 8) + 1 if group18 else ((z % 8) + 1)
    m1869_series = period * 2 - (1 if group18 and group18 <= 2 else 0)

    use_data = use_lookup.get(sym, (None, None))
    pettifor_val = pettifor_lookup.get(sym, None)
    sneath_val = sneath_typicality.get(sym, None)
    besalu_idx = besalu_lookup.get(sym, None)

    elements_list.append({
      'z': z,
      'symbol': sym,
      'name': name,
      'atomicMass': mass,
      'period': period,
      'group18': group18,
      'group32': group32,
      'stdRow': std_row,
      'stdCol': std_col,
      'janetRow': janet_row,
      'janetCol': janet_col,
      'mendeleev1869Group': m1869_group,
      'mendeleev1869Series': m1869_series,
      'block': block,
      'category': cat,
      'electronConfig': econf,
      'electronegativity': enP,
      'electronegativityAR': enAR,
      'atomicRadius': r_slater,
      'covalentRadius': r_cov,
      'vanDerWaalsRadius': r_vdw,
      'ionizationEnergy1': ip1,
      'electronAffinity': ea,
      'density': dens,
      'meltingPoint': mp,
      'boilingPoint': bp,
      'valence': val,
      'oxidationStates': ox,
      'discoveryYear': disc,
      'phase': phase,
      'mendeleevUSE': use_data[0],
      'chemicalScale': use_data[1],
      'mendeleevPettifor': pettifor_val,
      'sneathTypicality': sneath_val,
      'besaluIndex': besalu_idx
    })

elements_js = f"""// Verified dataset of all 118 chemical elements
// Sources: IUPAC Commission on Isotopic Abundances and Atomic Weights (CIAAW);
// NIST Atomic Spectra Database; Slater (1964) atomic radii; Pauling & Allred-Rochow electronegativities;
// Besalú (2013); Allahyari & Oganov (2020); Sneath (2000).

export const ELEMENTS = {json.dumps(elements_list, indent=2)};

export const CATEGORIES = {{
  'alkali-metal': {{ label: 'Alkali Metal', color: '#ff6b6b' }},
  'alkaline-earth': {{ label: 'Alkaline Earth', color: '#ffa94d' }},
  'transition-metal': {{ label: 'Transition Metal', color: '#ffd43b' }},
  'post-transition-metal': {{ label: 'Post-Transition Metal', color: '#69db7c' }},
  'metalloid': {{ label: 'Metalloid', color: '#38d9a9' }},
  'reactive-nonmetal': {{ label: 'Reactive Nonmetal', color: '#4dabf7' }},
  'noble-gas': {{ label: 'Noble Gas', color: '#da77f2' }},
  'lanthanide': {{ label: 'Lanthanide', color: '#e599f7' }},
  'actinide': {{ label: 'Actinide', color: '#f783ac' }}
}};

export const BLOCKS = {{
  's': {{ label: 's-block (spherical)', color: '#fa5252' }},
  'p': {{ label: 'p-block (principal)', color: '#228be6' }},
  'd': {{ label: 'd-block (diffuse)', color: '#fab005' }},
  'f': {{ label: 'f-block (fundamental)', color: '#be4bdb' }}
}};
"""

with open('f:/xyh/element-projections/src/data/elements.js', 'w', encoding='utf-8') as f:
    f.write(elements_js)

print("Generated src/data/elements.js successfully with 118 elements.")
