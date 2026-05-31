# Dongmodel

This context describes the language for a collecting app focused on items that owners have acquired but have not yet built, opened, played, used, or displayed.

Dongmodel's product voice is Thai-first, while its domain terms may use English names for documentation and implementation clarity.

## Language

**Modong**:
A single collectible unit that the owner has acquired but has not yet brought out for its intended activity, such as building, opening, playing, using, or displaying. Multiple copies are recorded as separate Modong rather than as a quantity. The product may present this in Thai as "โมดอง".
_Avoid_: backlog item, unbuilt item, unopened item, stored collectible, quantity

**Minimal Modong**:
A Modong that can be recorded with only a Modong Name, a Modong State defaulting to "โมดอง", and optionally a Collectible Kind. Photos, prices, years, notes, Storage Notes, and groups are not required to create it.
_Avoid_: draft item, incomplete item

**Wanted Item**:
A collectible that an Owner is looking for but does not yet own. Multiple wanted copies are recorded as separate Wanted Items rather than as a quantity. It is separate from Modong because it is not part of the owner's acquired collection yet. The product may present this in Thai as "ของที่ตามหา".
_Avoid_: wishlist item, target item, missing modong, wanted item, quantity

**Minimal Wanted Item**:
A Wanted Item that can be recorded with only a Wanted Name and a Wanted State defaulting to "กำลังงมเข็ม". Collectible Kind, Wanted List, Wanted Reference Photo, and Wanted Note are optional.
_Avoid_: draft wanted item, incomplete wanted item

**Wanted Name**:
The name used to identify a Wanted Item. The product may present this in Thai as "ชื่อของที่ตามหา".
_Avoid_: Modong Name, product title, SKU name

**Wanted State**:
The current search state of a Wanted Item. The product may present states in Thai as "กำลังงมเข็ม", "mission complete", "ห่างกันซักพัก", and "เราขาดกัน".
_Avoid_: wishlist status, search status

**Wanted Reference Photo**:
A reference photo used to help identify a Wanted Item. It may come from the owner's own photo, a shop, the internet, or another borrowed source, and is separate from a Modong Photo. It is not required.
_Avoid_: Modong Photo, owned item photo

**Acquired Wanted Item**:
A Wanted Item that the Owner has obtained and converted into a Modong. The resulting Modong uses a Modong Photo of the actual acquired item, not the Wanted Reference Photo as its owned-item photo.
_Avoid_: fulfilled wishlist item, purchased wanted item

**Mission Complete**:
A Wanted State meaning the Owner has obtained the Wanted Item. A Mission Complete item enters Modong immediately with the Modong State "โมดอง", and existing Wanted Shares show that the item has been received unless revoked.
_Avoid_: found, acquired, done

**Adopted In**:
The public phrase used for a Mission Complete item to convey that the Owner has received it. The product presents this in Thai as "ได้รับมาเลี้ยงดูแล้ว".
_Avoid_: bought, found, acquired

**Needle Hunting**:
A Wanted State meaning the Owner is actively looking for the Wanted Item. Wanted Share is intended for Needle Hunting items.
_Avoid_: active search, open request

**Taking A Break**:
A Wanted State meaning the Owner does not want the Wanted Item right now, for any private reason. The reason does not need to be recorded or shared.
_Avoid_: paused search, deferred, inactive

**Broken Up**:
A Wanted State meaning the Owner no longer wants to look for the Wanted Item, while keeping it recorded as search history.
_Avoid_: abandoned, cancelled, removed

**Modong State**:
The current lifecycle state of a Modong in the owner's collection. The product may present states in Thai as "โมดอง", "ต่อไม่เสร็จ", "ต่อแล้ว", "ปล่อยไปแล้ว", and "หลุมดำ".
_Avoid_: progress, status

**Unfinished Modong**:
A Modong that the owner has brought out for its intended activity but has not completed. Progress details belong in Private Note. The product may present this state in Thai as "ต่อไม่เสร็จ".
_Avoid_: in progress, started

**Completed Modong**:
A Modong whose intended activity has been completed by the owner. The product may present this state in Thai as "ต่อแล้ว".
_Avoid_: done, finished

**Released Modong**:
A Modong that has left the owner's collection, such as by being sold, given away, or otherwise transferred out, while remaining recorded as ownership history. When shared publicly, it is presented as having someone else continue to care for it. The product may present this state in Thai as "ปล่อยไปแล้ว".
_Avoid_: retired, removed, deleted

**Adopted Forward**:
The public phrase used for a Released Modong to convey that someone else has continued caring for it. The product presents this in Thai as "มีคนรับไปเลี้ยงดูต่อแล้ว".
_Avoid_: sold, transferred, disposed

**Black Hole Modong**:
A Modong that the owner has acquired before but can no longer locate. Black Hole Modong may be shared publicly when its state is shown clearly, and returns to the Modong State "โมดอง" when found.
_Avoid_: missing item, lost item, unknown location

**Storage Note**:
A personal note describing where the owner believes a Modong is kept, using whatever wording is meaningful to that owner. For Black Hole Modong, it may be used as a clue for finding the item. It is not a structured location hierarchy.
_Avoid_: storage location, warehouse location, shelf path

**Purchase Price**:
The amount and currency the owner paid to acquire a Modong. The default currency is THB.
_Avoid_: price, cost, value

**Release Price**:
The amount and currency the owner received when a Modong left the collection. It only applies to a Released Modong, and the default currency is THB.
_Avoid_: resale price, sale price, current value

**Released Away Year**:
The year when a Released Modong left the owner's collection.
_Avoid_: release year, sale date, transfer date

**Collectible Kind**:
A category that describes what kind of collectible a Modong or Wanted Item is, such as Gunpla, figure, board game, toy, or model kit. Owners choose from administrator-managed kinds, which may include "อื่น ๆ", and administrators may add more kinds over time.
_Avoid_: product category, item type, collection type

**Share Card**:
A public-facing presentation of a single Modong for sharing to social platforms and bringing viewers back to Dongmodel. A Share Card uses the Modong's Main Photo when available, otherwise the system default logo, and emphasizes its name, release year, and acquisition year. It does not show purchase or release prices.
_Avoid_: listing, sales post, public item page

**Group Share Card**:
A public-facing presentation of a Modong Group for sharing to social platforms and bringing viewers back to Dongmodel. A Group Share Card shows the Main Photos of up to five selected Modong from the group, using the Default Logo when a selected Modong has no Main Photo, plus details for all Modong in the group and the total count, without exposing purchase or release prices.
_Avoid_: collection listing, public folder, sales album

**Public Modong Detail**:
The Modong information that may appear in shared public presentations: Modong Name, Modong State, Release Year, Acquisition Year, and Collectible Kind.
_Avoid_: public profile data, sales detail

**Owner**:
A person who records and manages their own Modong and Wanted Items. Each Modong and Wanted Item has one Owner.
_Avoid_: user, collector, account

**Display Name**:
The public-facing name chosen by an Owner for shared pages. It does not have to be the Owner's real name.
_Avoid_: legal name, username, email

**Owner Handle**:
A unique, URL-safe identifier chosen by an Owner for links and lookup. It is separate from Display Name.
_Avoid_: display name, email, legal name

**Owner Gallery**:
A logged-in view that shows an Owner's displayable Modong that are still in the Owner's collection and not in the Black Hole Modong state in one Instagram-like page. Other logged-in Owners may view it, but anonymous viewers may not. It does not show purchase prices, release prices, Storage Notes, or Private Notes.
_Avoid_: public profile, feed, timeline

**Gallery Visibility**:
A per-Modong setting that controls whether the Modong appears in the Owner Gallery. It is shown by default for Modong that are eligible for the Owner Gallery.
_Avoid_: group visibility, public visibility, privacy level

**Gallery Modong Detail**:
The Modong information that may appear in the Owner Gallery: Main Photo, Modong Name, Modong State, Release Year, Acquisition Year, and Collectible Kind.
_Avoid_: Public Modong Detail, private modong detail

**Modong Search**:
The Owner's way to find Modong by name and narrow them by Modong State, Collectible Kind, Modong Group, Release Year, Acquisition Year, Black Hole Modong, or Released Modong.
_Avoid_: product search, catalog search

**Owner Summary**:
A private summary for an Owner that shows counts of Modong by Modong State and counts of Wanted Items. It does not show prices by default.
_Avoid_: public stats, leaderboard, valuation

**Private Value Summary**:
A private Owner-only summary based on Purchase Prices and Release Prices. It is not shown in Share Cards, Group Share Cards, Wanted Shares, public links, or Owner Galleries.
_Avoid_: public value, collection value, leaderboard value

**Admin**:
A person who manages shared system-level options, such as Collectible Kinds.
_Avoid_: moderator, staff, superuser

**External Share**:
A share action that takes a Share Card, Group Share Card, or Wanted Share out to an external social platform, such as Facebook or X. Shared public links can be viewed without login, show current live data, and do not use direct sign-up calls to action. Dongmodel does not have an in-app friend, follow, feed, or comment model.
_Avoid_: social feed, friend share, in-app post

**Revoked Share**:
A previously shared public link that the Owner has made unavailable.
_Avoid_: deleted post, hidden card, expired link

**Wanted Share**:
A public-facing presentation of a single Needle Hunting item used to ask others for help finding it and bringing viewers back to Dongmodel. It shows the Wanted Item's name, Wanted Reference Photo when available or the Default Logo otherwise, and the phrase "อยากรับมาเลี้ยงดู".
_Avoid_: buying post, marketplace listing, sales request

**Wanted Note**:
A private note for a Wanted Item, such as an acceptable price or search reminder. It is not shown on Wanted Share.
_Avoid_: offer price, buying budget, public request detail

**Private Note**:
A personal note about a Modong, such as a memory, plan, warning, or other owner-only context. It is not shown on Share Cards or Group Share Cards.
_Avoid_: description, caption, public note

**Sultan**:
The playful impression that an owner has strong collecting power or a well-funded collection. It is expressed through which Modong the owner has and how many there are, rather than by showing prices directly.
_Avoid_: Suratan, wealth, net worth, spending power

**Acquisition Year**:
The year when the owner acquired a Modong.
_Avoid_: purchase date, release year

**Acquisition Source**:
A free-form note describing where or how the owner acquired a Modong. It is not shown on Share Cards or Group Share Cards by default.
_Avoid_: seller, shop, vendor, origin

**Release Year**:
The year when the collectible itself was originally released to the market.
_Avoid_: acquisition year, purchase year

**Modong Photo**:
A photo of the actual Modong acquired by the owner. It is not a stock image, catalog image, official product render, or another person's item of the same model.
_Avoid_: product image, catalog image, reference image

**Main Photo**:
The primary Modong Photo used to represent a Modong, including on its Share Card. Each Modong may have one Main Photo, but it is not required.
_Avoid_: cover image, thumbnail

**Default Logo**:
The system-provided image used when a Modong or Wanted Item does not have an available photo for a shared or gallery presentation.
_Avoid_: placeholder image, missing image

**Additional Photo**:
An optional Modong Photo that shows another view of the same Modong. Each Modong may have up to five Additional Photos.
_Avoid_: gallery image, attachment

**Modong Name**:
The owner-chosen name used to identify a Modong. It does not have to match the collectible's official product name.
_Avoid_: official name, product title, SKU name

**Modong Group**:
An owner-defined group of Modong used to organize a collection. A user may have multiple Modong Groups, and a Modong may belong to multiple Modong Groups.
_Avoid_: collection, list, folder

**Group Note**:
A personal note about a Modong Group. It is not shown on Group Share Cards.
_Avoid_: group description, public group caption

**Wanted List**:
An owner-defined group of Wanted Items used to organize collectibles the Owner wants to find. A Wanted Item may belong to one Wanted List or no Wanted List, and Wanted Lists are not shared publicly. Wanted Items do not belong to Modong Groups.
_Avoid_: Modong Group, collection, folder

**Wanted Search**:
The Owner's way to find Wanted Items by Wanted Name and narrow them by Wanted State, Collectible Kind, or Wanted List.
_Avoid_: wishlist search, marketplace search
