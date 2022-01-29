import {
    DEFAULT_PERSPECTIVE_OFFSET,
    DEFAULT_CONTAINERWIDTH,
    DEFAULT_CONTAINERHEIGHT,
    DEFAULT_UPDATE_FREQUENCY,
} from "./Constants.js";

/**
 * Константа pi
 */
export const pi = 3.141592;
/**
 * один градус через pi, где pi соответсвует половине окружности
 */
export const deg = pi / 180;

/**
 * Объект 3D-мира,
 * создается в HTML-элементе с id="container"
 *
 * @param {PlayerClass} Player в качестве аргумента принимает объект типа PlayerClass,
 * это фактически наблюдатель, глазами которого мы будем видеть мир
 */
export class World3D {
    constructor(Player) {
        this.Player = Player;

        this.World = null;

        /**
         * на какую величину за один раз менять координаты,
         * это условные величины
         */
        this.__Deltas = {
            LeftRight: 1,
            UpDown: 1,
            ForwardBack: 1,
            RotateX: 1,
            RotateY: 1,
        };

        // значение перспективы (условно откуда наблюдаем за сценой)
        this.PerspectiveOffset = DEFAULT_PERSPECTIVE_OFFSET;
        // размер контейнера
        this.ContainerWidth = DEFAULT_CONTAINERWIDTH;
        this.ContainerHeight = DEFAULT_CONTAINERHEIGHT;
        // Нажата ли клавиша?
        this.PressBack = 0;
        this.PressForward = 0;
        this.PressLeft = 0;
        this.PressRight = 0;
        this.PressUp = 0;
        this.PressDown = 0;
        // двигается ли мышь?
        this.MouseX = 0;
        this.MouseY = 0;

        // Введен ли захват мыши?
        this.LockMouseFlag = false;

        // На земле ли игрок?
        this.OnGroundFlag = true;
    }
    get Deltas() {
        return this.__Deltas;
    }
    set Deltas(Deltas) {
        this.__Deltas = Object.assign(this.__Deltas, Deltas);
    }

    /**
     * Обработчик нажатия клавиш
     *
     * @param {KeyboardEvent} event
     */
    onKeyDown(event) {
        if (event.key == "a" || event.code == "ArrowLeft") {
            this.PressLeft = 1;
        }
        if (event.key == "w" || event.code == "ArrowUp") {
            this.PressForward = 1;
        }
        if (event.key == "d" || event.code == "ArrowRight") {
            this.PressRight = 1;
        }
        if (event.key == "s" || event.code == "ArrowDown") {
            this.PressBack = 1;
        }
        if (
            (event.code == "Space" || event.code == "PageUp") &&
            this.OnGroundFlag
        ) {
            this.PressUp = 1;
        }
        if (event.code == "PageDown" && !this.OnGroundFlag) {
            this.PressDown = 1;
        }

        // поворот влево
        if (event.key == "q") {
            this.MouseX = -1;
        }
        // поворот вправо
        if (event.key == "e") {
            this.MouseX = 1;
        }
    }

    /**
     * Обработчик отжатия клавиш
     *
     * @param {KeyboardEvent} event
     */
    onKeyUp(event) {
        if (event.key == "a" || event.code == "ArrowLeft") {
            this.PressLeft = 0;
        }
        if (event.key == "w" || event.code == "ArrowUp") {
            this.PressForward = 0;
        }
        if (event.key == "d" || event.code == "ArrowRight") {
            this.PressRight = 0;
        }
        if (event.key == "s" || event.code == "ArrowDown") {
            this.PressBack = 0;
        }
        if (event.code == "Space" || event.code == "PageUp") {
            this.PressUp = 0;
        }
        if (event.code == "PageDown") {
            this.PressDown = 0;
        }
    }

    /**
     * Обработчик изменения состояния захвата курсора
     *
     * @param {Event} event
     */
    onPointerLockChange(event) {
        console.log("[onPointerLockChange] ===> event: ", event);
        this.LockMouseFlag = !this.LockMouseFlag;
        if (this.LockMouseFlag) {
            // Включаем обработчик движения мыши
            document.addEventListener("mousemove", this.setMouseCoords);
        } else {
            // Отключаем обработчик движения мыши
            document.removeEventListener("mousemove", this.setMouseCoords);
        }
    }

    /**
     * Обработчик нажатия в контейнере - захват курсора мыши
     */
    onClick() {
        if (!this.LockMouseFlag) {
            this.Container.requestPointerLock();
        }
    }

    /**
     * Сохраняет смещения курсора мыши по осям в локальных переменных,
     * Здесь, в setMouseCoords сохраняется именно объект функции с контекстов this,
     * т.е. функция связывается с контекстом текущего объекта через bind(this),
     * так как при выхове этой функции в событии контекст будет потерян,
     * и, скорее всего, это будет window.
     * Такая переменная нужна, чтобы и в addEventListener и в removeEventListener
     * передавался один и тот же обработчик,
     * т.е. нужно запомнить ссылку на один и тот же объект функции
     * Если этого не сделать, а связывать во время вызова addEventListener,
     * и потом тоже самое сделать в removeEventListener,
     * то будут созданы два разных объекта, и removeEventListener не удалит обработчик,
     * который установлен в addEventListener,
     * так как ему будет передан другой созданный bind объект
     *
     * @param {MouseEvent} event
     */
    setMouseCoords = function (event) {
        this.MouseX = event.movementX;
        this.MouseY = event.movementY;
    }.bind(this);

    /**
     * обновляет положение наблюдателя,
     * пересчитывает координаты, если произошло смещение
     */
    update() {
        const MoveRight = this.PressRight * this.Deltas.LeftRight;
        const MoveLeft = this.PressLeft * this.Deltas.LeftRight;
        const MoveBack = this.PressBack * this.Deltas.ForwardBack;
        const MoveForward = this.PressForward * this.Deltas.ForwardBack;
        const MoveUp = this.PressUp * this.Deltas.UpDown;
        const MoveDown = this.PressDown * this.Deltas.UpDown;
        // у нас ось X направлена слева направо,
        // поэтому вращая вокруг этой оси отслеживаем изменения курсора по вертикали, т.е. по Y
        const RotateX = this.MouseY * this.Deltas.RotateX;
        // у нас ось Y направлена сверху вниз,
        // поэтому вращая вокруг этой оси отслеживаем изменения курсора по горизонтали, т.е. по X
        const RotateY = this.MouseX * this.Deltas.RotateY;

        // Задаем локальные переменные смещения
        let dx =
            (MoveRight - MoveLeft) * Math.cos(this.Player.ry * deg) -
            (MoveForward - MoveBack) * Math.sin(this.Player.ry * deg);
        let dz =
            -(MoveForward - MoveBack) * Math.cos(this.Player.ry * deg) -
            (MoveRight - MoveLeft) * Math.sin(this.Player.ry * deg);
        let dy = -(MoveUp - MoveDown);
        let drx = RotateX;
        let dry = -RotateY;

        // Обнулим смещения мыши:
        this.MouseX = this.MouseY = 0;

        // Проверяем коллизию с прямоугольниками
        this.collision();

        // Прибавляем смещения к координатам
        // ось x - это влево-вправо
        this.Player.x = this.Player.x + dx;
        // ось y - это вверх-вниз
        this.Player.y = this.Player.y + dy;
        // ось z - это вперед-назад (вглубь монитора)
        this.Player.z = this.Player.z + dz;
        // console.log(this.Player.x + ":" + this.Player.y + ":" + this.Player.z);
        // проверяем на земле игрок
        if (this.Player.y == 0) {
            this.OnGroundFlag = true;
        }

        // или нет
        else {
            this.OnGroundFlag = false;
        }

        // Если курсор захвачен, разрешаем вращение
        // if (this.LockMouseFlag) {
        if (true) {
            this.Player.rx = this.Player.rx + drx;
            this.Player.ry = this.Player.ry + dry;
        }

        // Изменяем координаты мира (для отображения)
        this.World.style.transform =
            "translateZ(" +
            (this.PerspectiveOffset - 0) +
            "px)" +
            "rotateX(" +
            -this.Player.rx +
            "deg)" +
            "rotateY(" +
            -this.Player.ry +
            "deg)" +
            "translate3d(" +
            -this.Player.x +
            "px," +
            -this.Player.y +
            "px," +
            -this.Player.z +
            "px)";
    }

    /**
     * Создает внутри объекта World3D набор элементов (<div>) на основе массива this.Map3D
     *
     * @param {Array} Map3D Массив прямоугольников. Каждый элемент массива - 8 цифр и строковео значение,
     * первые три числа (0,1,2) – это координаты центра прямоугольника,
     * вторые три числа (3,4,5) – углы поворота в градусах (относительно того же центра),
     * затем два числа (6,7) – его размеры
     * последнее значение (8) – фон, может быть сплошным цветом, градиентом или фотографией (текстурой).
     */
    createNewWorld(Map3D) {
        this.Map3D = Map3D;

        // Привяжем новую переменную к this.World
        this.World = document.createElement("div");
        this.World.setAttribute("id", "world");
        this.World.classList.add("world");

        for (let i = 0; i < this.Map3D.length; i++) {
            // Создание прямоугольника и придание ему стилей
            let newElement = document.createElement("div");
            newElement.className = "square";
            newElement.id = "square" + i;
            newElement.style.width = this.Map3D[i][6] + "px";
            newElement.style.height = this.Map3D[i][7] + "px";
            newElement.style.background = this.Map3D[i][8];
            newElement.style.transform =
                "translate3d(" +
                (this.ContainerWidth / 2 -
                    this.Map3D[i][6] / 2 +
                    this.Map3D[i][0]) +
                "px," + // по оси X
                (this.ContainerHeight / 2 -
                    this.Map3D[i][7] / 2 +
                    this.Map3D[i][1]) +
                "px," + // по оси Y
                this.Map3D[i][2] +
                "px)" + // по оси Z
                "rotateX(" +
                this.Map3D[i][3] +
                "deg)" +
                "rotateY(" +
                this.Map3D[i][4] +
                "deg)" +
                "rotateZ(" +
                this.Map3D[i][5] +
                "deg)";

            // Вставка прямоугольника в this.World
            this.World.append(newElement);
        }
    }

    collision() {
        let dx = 0,
            dy = 0,
            dz = 0;

        for (let i = 0; i < this.Map3D.length; i++) {
            // рассчитываем координаты игрока в системе координат прямоугольника
            let x0 = this.Player.x - this.Map3D[i][0];
            let y0 = this.Player.y - this.Map3D[i][1];
            let z0 = this.Player.z - this.Map3D[i][2];

            if (
                x0 ** 2 + y0 ** 2 + z0 ** 2 + dx ** 2 + dy ** 2 + dz ** 2 <
                this.Map3D[i][6] ** 2 + this.Map3D[i][7] ** 2
            ) {
                let x1 = x0 + dx;
                let y1 = y0 + dy;
                let z1 = z0 + dz;

                let point0 = this.coorTransform(
                    x0,
                    y0,
                    z0,
                    this.Map3D[i][3],
                    this.Map3D[i][4],
                    this.Map3D[i][5]
                );
                let point1 = this.coorTransform(
                    x1,
                    y1,
                    z1,
                    this.Map3D[i][3],
                    this.Map3D[i][4],
                    this.Map3D[i][5]
                );
                let point2 = new Array();

                // Условие коллизии и действия при нем
                if (
                    Math.abs(point1[0]) < (this.Map3D[i][6] + 98) / 2 &&
                    Math.abs(point1[1]) < (this.Map3D[i][7] + 98) / 2 &&
                    Math.abs(point1[2]) < 50
                ) {
                    point1[2] = Math.sign(point0[2]) * 50;
                    point2 = this.coorReTransform(
                        point1[0],
                        point1[1],
                        point1[2],
                        this.Map3D[i][3],
                        this.Map3D[i][4],
                        this.Map3D[i][5]
                    );
                    dx = point2[0] - x0;
                    dy = point2[1] - y0;
                    dz = point2[2] - z0;
                }
            }
        }
    }

    coorTransform(x0, y0, z0, rxc, ryc, rzc) {
        let x1 = x0;
        let y1 = y0 * Math.cos(rxc * deg) + z0 * Math.sin(rxc * deg);
        let z1 = -y0 * Math.sin(rxc * deg) + z0 * Math.cos(rxc * deg);
        let x2 = x1 * Math.cos(ryc * deg) - z1 * Math.sin(ryc * deg);
        let y2 = y1;
        let z2 = x1 * Math.sin(ryc * deg) + z1 * Math.cos(ryc * deg);
        let x3 = x2 * Math.cos(rzc * deg) + y2 * Math.sin(rzc * deg);
        let y3 = -x2 * Math.sin(rzc * deg) + y2 * Math.cos(rzc * deg);
        let z3 = z2;
        return [x3, y3, z3];
    }

    coorReTransform(x3, y3, z3, rxc, ryc, rzc) {
        let x2 = x3 * Math.cos(rzc * deg) - y3 * Math.sin(rzc * deg);
        let y2 = x3 * Math.sin(rzc * deg) + y3 * Math.cos(rzc * deg);
        let z2 = z3;
        let x1 = x2 * Math.cos(ryc * deg) + z2 * Math.sin(ryc * deg);
        let y1 = y2;
        let z1 = -x2 * Math.sin(ryc * deg) + z2 * Math.cos(ryc * deg);
        let x0 = x1;
        let y0 = y1 * Math.cos(rxc * deg) - z1 * Math.sin(rxc * deg);
        let z0 = y1 * Math.sin(rxc * deg) + z1 * Math.cos(rxc * deg);
        return [x0, y0, z0];
    }

    /**
     * Запускает обработку событий в 3D-мире,
     *
     * @param {*} ContainerWidth ширина контейнера, в который помещается мир
     * @param {*} ContainerHeight высота контейнера, в который помещается мир
     * @param {*} PerspectiveOffset перспектива, условно - это точка с которой мы обозреваем мир
     * @param {*} UpdateFrequency частота обновления сцен в мире, по умолчанию 10мс, т.е. 100 раз в секунду
     */
    run(
        ContainerWidth = DEFAULT_CONTAINERWIDTH,
        ContainerHeight = DEFAULT_CONTAINERHEIGHT,
        PerspectiveOffset = DEFAULT_PERSPECTIVE_OFFSET,
        UpdateFrequency = DEFAULT_UPDATE_FREQUENCY
    ) {
        if (!this.World) {
            throw new Error("Не создан объект World3D");
        }

        // значение перспективы (условно откуда наблюдаем за сценой)
        this.PerspectiveOffset = PerspectiveOffset;
        // размер контейнера
        this.ContainerWidth = ContainerWidth;
        this.ContainerHeight = ContainerHeight;

        /**
         * Получим контейнер для 3D-сцен в переменную this.Container.
         * В html-файле должен быть элемент div с id="container"
         */
        this.Container = document.getElementById("container");
        this.Container.style.setProperty(
            "--container-width",
            this.ContainerWidth + "px"
        );
        this.Container.style.setProperty(
            "--container-height",
            this.ContainerHeight + "px"
        );
        this.Container.style.setProperty(
            "--perspective-offset",
            this.PerspectiveOffset + "px"
        );

        this.Container.appendChild(this.World);

        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));

        document.addEventListener(
            "pointerlockchange",
            this.onPointerLockChange.bind(this)
        );

        this.Container.onclick = this.onClick.bind(this);

        this.TimerGame = setInterval(this.update.bind(this), UpdateFrequency);
    }
}

export default World3D;
