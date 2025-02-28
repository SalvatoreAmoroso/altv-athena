import * as alt from 'alt-client';
import { PushVehicle } from '../../../client/systems/push';
import { isAnyMenuOpen } from '../../../client/utility/menus';
import { IClientWheelItem, WheelMenu } from '../../../client/utility/wheelMenu';
import { PLAYER_SYNCED_META } from '../../../shared/enums/playerSynced';
import { InputOptionType, InputResult } from '../../../shared/interfaces/inputMenus';
import { InputView } from '../../../client/views/input';
import { INTERIOR_INTERACTIONS } from '../../../shared-plugins/core-interiors/enums';
import { Interior } from '../../../shared-plugins/core-interiors/interfaces';
import { LOCALE_INTERIOR_VIEW } from '../../../shared-plugins/core-interiors/locales';

function initialCheck(): boolean {
    if (alt.Player.local.vehicle) {
        return false;
    }

    if (isAnyMenuOpen()) {
        return false;
    }

    if (PushVehicle.isPushing()) {
        return false;
    }

    return true;
}

function showMenu(interior: Interior, isOutside: boolean = true) {
    if (isOutside) {
        enterMenu(interior);
        return;
    }

    exitMenu(interior);
}

function enterMenu(interior: Interior) {
    if (!initialCheck) {
        return;
    }

    const options: IClientWheelItem[] = [];
    const playerIdentifier = alt.Player.local.getSyncedMeta(PLAYER_SYNCED_META.DATABASE_ID);
    const isOwner = interior.owner === playerIdentifier;

    const toggleLockFunc = () => {
        alt.emitServer(INTERIOR_INTERACTIONS.TOGGLE_LOCK, interior.uid);
    };

    options.push({
        name: interior.isUnlocked
            ? `~o~${LOCALE_INTERIOR_VIEW.LABEL_TRY_LOCK}`
            : `~g~${LOCALE_INTERIOR_VIEW.LABEL_TRY_UNLOCK}`,
        callback: toggleLockFunc,
    });

    options.push({
        name: 'UID',
        callback: () => {
            console.log(`===> ${interior.name}`);
            console.log(`UID: ${interior.uid}`);
        },
    });

    // Ownership Related Menu Functions
    if (isOwner) {
        options.push({
            name: LOCALE_INTERIOR_VIEW.LABEL_SET_SALE_PRICE,
            callback: () => {
                const InputMenu = {
                    title: LOCALE_INTERIOR_VIEW.LABEL_SALE_PRICE,
                    options: [
                        {
                            id: 'price',
                            desc: LOCALE_INTERIOR_VIEW.LABEL_SALE_PLACHOLDER,
                            type: InputOptionType.NUMBER,
                            placeholder: '25000',
                        },
                    ],
                    callback: (results: InputResult[]) => {
                        // Re-show this menu if it fails to find the value.
                        if (results.length <= 0) {
                            InputView.setMenu(InputMenu);
                            return;
                        }

                        // Check that there is a result.
                        const data = results.find((x) => x && x.id === 'price');
                        if (!data) {
                            InputView.setMenu(InputMenu);
                            return;
                        }

                        alt.emitServer(INTERIOR_INTERACTIONS.SET_PRICE, interior.uid, parseInt(data.value));
                    },
                };

                InputView.setMenu(InputMenu);
            },
        });

        options.push({
            name: LOCALE_INTERIOR_VIEW.LABEL_SET_HOUSE_NAME,
            callback: () => {
                const InputMenu = {
                    title: LOCALE_INTERIOR_VIEW.LABEL_SET_HOUSE_NAME,
                    options: [
                        {
                            id: 'name',
                            desc: LOCALE_INTERIOR_VIEW.LABEL_SET_HOUSE_NAME_PLACEHOLDER,
                            type: InputOptionType.TEXT,
                            placeholder: `Stuyks House`,
                            regex: '^[a-zA-Z0-9 ]{1,24}$', // Matches 3 to 24 Characters
                            error: '3-24 Characters. No Special Characters.',
                        },
                    ],
                    callback: (results: InputResult[]) => {
                        // Re-show this menu if it fails to find the value.
                        if (results.length <= 0) {
                            InputView.setMenu(InputMenu);
                            return;
                        }

                        // Check that there is a result.
                        const data = results.find((x) => x && x.id === 'name');
                        if (!data) {
                            InputView.setMenu(InputMenu);
                            return;
                        }

                        alt.emitServer(INTERIOR_INTERACTIONS.SET_NAME, interior.uid, data.value);
                    },
                };

                InputView.setMenu(InputMenu);
            },
        });
    }

    if (!isOwner && interior.price >= 1) {
        options.push({
            name: `${LOCALE_INTERIOR_VIEW.LABEL_PURCHASE}~n~~p~$${interior.price}`,
            callback: () => {
                alt.emitServer(INTERIOR_INTERACTIONS.PURCHASE, interior.uid);
            },
        });
    }

    if (interior.isUnlocked) {
        options.push({
            name: `~g~${LOCALE_INTERIOR_VIEW.LABEL_ENTER}`,
            callback: () => {
                alt.emitServer(INTERIOR_INTERACTIONS.ENTER, interior.uid);
            },
        });
    }

    WheelMenu.create(interior.name, options, true);
}

function exitMenu(interior: Interior) {
    if (!initialCheck) {
        return;
    }

    const options: IClientWheelItem[] = [];

    const playerIdentifier = alt.Player.local.getSyncedMeta(PLAYER_SYNCED_META.DATABASE_ID);
    const isOwner = interior.owner === playerIdentifier;
    const toggleLockFunc = () => {
        alt.emitServer(INTERIOR_INTERACTIONS.TOGGLE_LOCK, interior.uid);
    };

    options.push({
        name: interior.isUnlocked
            ? `~o~${LOCALE_INTERIOR_VIEW.LABEL_TRY_LOCK}`
            : `~g~${LOCALE_INTERIOR_VIEW.LABEL_TRY_UNLOCK}`,
        callback: toggleLockFunc,
    });

    options.push({
        name: 'UID',
        callback: () => {
            console.log(`===> ${interior.name}`);
            console.log(`UID: ${interior.uid}`);
        },
    });

    // Ownership Related Menu Functions
    if (isOwner) {
        options.push({
            name: LOCALE_INTERIOR_VIEW.LABEL_STORAGE,
            callback: () => {
                alt.emitServer(INTERIOR_INTERACTIONS.STORAGE, interior.uid);
            },
        });
    }

    options.push({
        name: `~r~${LOCALE_INTERIOR_VIEW.LABEL_EXIT}`,
        callback: () => {
            alt.emitServer(INTERIOR_INTERACTIONS.EXIT, interior.uid);
        },
    });

    WheelMenu.create(`${interior.name}`, options, true);
}

alt.onServer(INTERIOR_INTERACTIONS.SHOW_MENU, showMenu);
