// Массив прямоугольников
import Map3D from "./Map3D.js";
// класс наблюдателя
import PlayerClass from "./PlayerClass.js";
// класс 3D-мира
import World3D from "./World3D";

import {
    DEFAULT_CONTAINERWIDTH,
    DEFAULT_CONTAINERHEIGHT,
    DEFAULT_PERSPECTIVE_OFFSET,
} from "./Constants.js";

// размер контейнера
const ContainerWidth = DEFAULT_CONTAINERWIDTH;
const ContainerHeight = DEFAULT_CONTAINERHEIGHT;
// значение перспективы (условно откуда наблюдаем за сценой)
const PerspectiveOffset = DEFAULT_PERSPECTIVE_OFFSET;

// Создаем новый объект
const Player1 = new PlayerClass(-900, 0, -900, 0, -135);

const NewWorld = new World3D(Player1);

const Delta = 20;

World3D.Deltas = {
    LeftRight: Delta,
    UpDown: Delta,
    ForwardBack: Delta,
    RotateX: Delta,
    RotateY: Delta,
};

NewWorld.createNewWorld(Map3D);
NewWorld.run(ContainerWidth, ContainerHeight, PerspectiveOffset, 5);
