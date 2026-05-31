# Dongmodel MVP

Dongmodel is a Thai-first web app for collectors to record, organize, and share the things they have acquired, the things they are looking for, and the stories around both.

## Core Objects

- **Modong**: an acquired collectible unit, recorded one unit at a time with no quantity field.
- **Wanted Item**: a collectible the Owner is looking for, recorded one item at a time with no quantity field.
- **Modong Group**: an Owner-defined group for Modong. A Modong may belong to multiple groups.
- **Wanted List**: an Owner-defined list for Wanted Items. A Wanted Item may belong to one Wanted List or no list.

The first organization API slice supports Modong Group CRUD, adding and removing Modong from groups, and Wanted List CRUD.

## Modong

Required to create:

- Modong Name
- Modong State, defaulting to "โมดอง"
- Collectible Kind is optional

Optional details:

- Main Photo
- Up to five Additional Photos
- Purchase Price with currency, default THB
- Release Price with currency for Released Modong, default THB
- Release Year
- Acquisition Year
- Released Away Year
- Acquisition Source
- Storage Note
- Private Note
- Modong Groups

The first API slice supports Owner-scoped create, list, detail, update, and delete for Modong non-photo fields. Photo upload and group membership are separate slices.

The photo API supports replacing one Main Photo and adding up to five Additional Photos per Modong.

Modong states:

- โมดอง
- ต่อไม่เสร็จ
- ต่อแล้ว
- ปล่อยไปแล้ว
- หลุมดำ

## Wanted Items

Required to create:

- Wanted Name
- Wanted State, defaulting to "กำลังงมเข็ม"

Optional details:

- Collectible Kind
- Wanted List
- Wanted Reference Photo
- Wanted Note

Wanted states:

- กำลังงมเข็ม
- mission complete
- ห่างกันซักพัก
- เราขาดกัน

When a Wanted Item becomes `mission complete`, it immediately enters Modong with Modong State "โมดอง".

The first API slice supports Owner-scoped create, list, detail, update, and delete for Wanted Items. Setting a Wanted Item to `mission complete` creates the corresponding Modong immediately.

The photo API supports replacing one Wanted Reference Photo per Wanted Item.

## Sharing

Public share links can be viewed without login, use random share tokens, show live data, and can be revoked by the Owner.

Share surfaces:

- **Share Card**: shares a single Modong.
- **Group Share Card**: shares a Modong Group with up to five selected Modong images, details for all Modong in the group, and the total count.
- **Wanted Share**: shares a single Wanted Item only when it is in "กำลังงมเข็ม".

Public sharing never shows purchase prices, release prices, Storage Notes, Private Notes, Group Notes, Wanted Notes, or direct sign-up calls to action.

Public phrases:

- Wanted Share: "อยากรับมาเลี้ยงดู"
- Mission Complete: "ได้รับมาเลี้ยงดูแล้ว"
- Released Modong: "มีคนรับไปเลี้ยงดูต่อแล้ว"

## Gallery

Owner Gallery is visible only to logged-in Owners. It is an Instagram-like page that shows another Owner's displayable Modong.

Owner Gallery:

- Shows only Modong that are still in the Owner's collection.
- Does not show Released Modong.
- Does not show Black Hole Modong.
- Shows "โมดอง", "ต่อไม่เสร็จ", and "ต่อแล้ว" when Gallery Visibility is enabled.
- Uses Gallery Visibility at the Modong level.
- Shows Modong by default when eligible.
- Does not show prices, Storage Notes, or Private Notes.

Gallery item details:

- Main Photo
- Modong Name
- Modong State
- Release Year
- Acquisition Year
- Collectible Kind

## Search And Summary

Modong Search supports name search and filters by:

- Modong State
- Collectible Kind
- Modong Group
- Release Year
- Acquisition Year
- Black Hole Modong
- Released Modong

Wanted Search supports name search and filters by:

- Wanted State
- Collectible Kind
- Wanted List

Owner Summary is private and shows counts of Modong by state and counts of Wanted Items. Private Value Summary is Owner-only and never appears in share links or galleries.

## Out Of Scope For MVP

- In-app friends, follows, feeds, comments, or chat
- Public anonymous Owner profiles
- Wanted List sharing
- Notifications or reminders
- Import or export
- Progress fields outside Private Note
- Structured storage hierarchy
- Quantity fields
