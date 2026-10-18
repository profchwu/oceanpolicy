# Coral baseline correction

The reef low-state image is now clearly bleached with a visible wastewater plume. It also forms the reef base layer, preventing unmasked parts of the original healthy scenery from leaking through. Water and coral health are independent visual channels. Their healthy-image blend is (clamp(index,0,100)/100)^2, an illustrative display curve, not a scientific prediction or coral-cover percentage.

Initial indices remain 65 power / 30 water / 65 coral to preserve existing simulation and scoring. Initial water shows 9% clear-image blend; coral shows 42.25% recovered-image blend, retaining obvious bleaching. At coral 33, only 10.89% recovered imagery appears. Good-route final coral 56 still retains bleaching (31.36% recovered blend). Local water treatment does not imply removal of heat stress. All original policy deltas, scoring and stored records remain unchanged.

Asset: public/environment-states/reef-low-v2.png
Generator: built-in imagegen (edit).
