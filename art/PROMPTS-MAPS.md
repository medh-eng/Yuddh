# YUDDH art prompts: campaign maps (4 images, optional, any time)

A painted map behind each campaign's row of battles on the campaign screen. The game already draws a winding route, a gold frame and a compass over whatever is behind it, so these paintings must be **calm, decorative landscapes**, not labelled maps: not to scale, no route, no border, no compass, no text, no place names, no watermark.

Landscape 16:9, as large as the tool allows. Same style as the battlefields: use the landscape style block from `PROMPTS-BATCH2.md` (top-down painted cloth map, aged cloth texture, Indian miniature painting style). **Keep the middle band of the picture open and quiet** (soft ground, water or fields), because the battle cards sit there; put the interesting details around the top and bottom edges and in the corners. Leave the lower right corner a little calmer (the compass sits there).

Upload to `art/source/battlefields/` with the exact names below. Tell Claude when they are in; Claude then switches each campaign to its map (one line each in `campaign.ts`).

| File | Campaign | Prompt (add after the style block) |
| --- | --- | --- |
| `map_maurya.png` | Maurya, Rise of Magadha | Painted cloth map of northern India in the time of the Mauryas: the broad river Ganga winding along the top edge with the walled city of Pataliputra and its wooden palisade in the upper left, green plains and farm fields in the middle band kept open and quiet, the Indus and snow mountains of the north-west along the bottom edge, a few elephants, caravans and bullock carts on distant roads, banyan trees and village huts at the borders. |
| `map_gupta.png` | Gupta, The Golden Age | Painted cloth map of central and southern India in the Gupta age: the Ganga plain with river boats and temples along the top, a dark green belt of forest with tiger tracks on the left, a walled southern city with a tall gateway on the right, the open middle band left calm (fields and a road), the sea along the bottom right edge with a small sailing ship, a pillar of iron or stone at one corner. |
| `map_chalukya.png` | Chalukya, Tigers of the South | Painted cloth map of the Deccan plateau: red-brown hills and a broad river (the Narmada) crossing the top third, rock-cut cave temples and a stone fort on a hill at one corner, golden fields and boulders at the edges, the open middle band calm with only a faint road, a boar-banner on a small camp tent in a far corner. |
| `map_chola.png` | Chola, The Tiger Banner | Painted cloth map of the Bay of Bengal in the Chola age: the green coast of the Tamil country with a tall temple tower in the lower left, a delta of river mouths with bathing ghats and boats along the top edge, a calm blue-green sea filling the open middle band with a few small sailing ships far apart, a tiled harbour and a palm-fringed shore of the far Malay coast in the right corner, gulls and wave patterns at the edges. |

Optional later: a fifth map for the Rajput campaign when it opens.
