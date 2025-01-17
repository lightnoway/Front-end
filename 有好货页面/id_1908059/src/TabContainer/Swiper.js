import MyCreate, { Component } from "MyCreate";
import enableGesture from "~/lib/gesture";
import {
  Timeline,
  DOMElementStyleNumberAnimation,
  ease
} from "~/lib/animation";

import "./Swiper.css";

export default class Swiper extends Component {
  componentDidMount() {
    const container = document.getElementsByClassName("Swiper-container")[0];
    enableGesture(container);

    const children = container.childNodes;
    let position = 0;
    let offset = 0;
    let tl = new Timeline();
    let offsetTimeStart = 0;
    this.elementWidth = parseInt(
      window.getComputedStyle(document.getElementsByClassName("Swiper-item")[0])
        .width
    );
    this.transitMethod = ease;
    this.transitionDuration = 500;
    let positionOf = element => {
      let position = element.style.transform.match(/\((.*?)\)/g)[0];
      if (position.slice(position.length - 2, position.length - 1) === "%") {
        return (
          (parseInt(position.slice(1, position.length - 2)) *
            this.elementWidth) /
          100
        );
      } else if (
        position.slice(position.length - 3, position.length - 1) === "px"
      ) {
        return parseInt(position.slice(1, position.length - 3));
      } else console.log("positionOf error, positoin=", position);
    };
    let nextFrame = (i = 1) => {
      let current = children[position];
      let nextPosition = (position + 1) % children.length;
      let next = children[nextPosition];
      let nextNextPosition = (nextPosition + 1) % children.length;
      let nextNext = children[nextNextPosition];
      offsetTimeStart = Date.now();
      tl.clearAnimations();
      if (i === -1) {
        current.style.transform = `translate(${-this.elementWidth -
          this.elementWidth * position}px)`;
      } else {
        let currentPo = positionOf(current);
        let currentDis =
          Math.abs(
            -this.elementWidth - this.elementWidth * position - currentPo
          ) / this.elementWidth;
        tl.addAnimation(
          new DOMElementStyleNumberAnimation(
            current,
            "transform",
            0,
            currentPo,
            currentDis * this.transitionDuration,
            -this.elementWidth - this.elementWidth * position,
            this.transitMethod,
            v => `translateX(${v}px)`
          )
        );
      }
      if (i === 1) {
        nextNext.style.transform = `translate(${this.elementWidth -
          this.elementWidth * nextNextPosition}px)`;
      } else {
        let nextNextPo = positionOf(nextNext);
        let nextNextDis =
          Math.abs(
            this.elementWidth -
              this.elementWidth * nextNextPosition -
              nextNextPo
          ) / this.elementWidth;
        tl.addAnimation(
          new DOMElementStyleNumberAnimation(
            nextNext,
            "transform",
            0,
            nextNextPo,
            nextNextDis * this.transitionDuration,
            this.elementWidth - this.elementWidth * nextNextPosition,
            this.transitMethod,
            v => `translateX(${v}px)`
          )
        );
      }
      let nextPo = positionOf(next);
      let nextDis =
        Math.abs(-this.elementWidth * nextPosition - nextPo) /
        this.elementWidth;
      tl.addAnimation(
        new DOMElementStyleNumberAnimation(
          next,
          "transform",
          0,
          nextPo,
          this.transitionDuration * nextDis,
          -this.elementWidth * nextPosition,
          this.transitMethod,
          v => `translateX(${v}px)`
        )
      );
      tl.restart();
      position = nextPosition;
    };

    container.addEventListener("pan", event => {
      if (event.isVertical) return;
      if (
        (position === 0 && event.dx > 0) ||
        (position === children.length - 1 && event.dx < 0)
      ) {
        return;
      }
      let current = children[position];
      let nextPosition = position + 1;
      let next = children[nextPosition];
      let previousPosition = position - 1;
      let previous = children[previousPosition];
      current.style.transform = `translate(${-position * this.elementWidth +
        event.dx +
        offset}px`;
      if (next) {
        next.style.transform = `translate(${this.elementWidth -
          this.elementWidth * nextPosition +
          event.dx +
          offset}px)`;
      }
      if (previous) {
        previous.style.transform = `translate(${this.elementWidth *
          (-1 - previousPosition) +
          event.dx +
          offset}px)`;
      }
    });

    container.addEventListener("panend", event => {
      let condition = 0;
      if (event.isVertical) return;
      if (
        (position === 0 && event.dx > 0) ||
        (position === children.length - 1 && event.dx < 0)
      ) {
        return;
      }
      if (event.isFlick && Math.abs(event.dx) > Math.abs(event.dy)) {
        condition = event.dx < 0 ? 1 : -1;
      } else {
        let x = event.dx;
        condition =
          x < -this.elementWidth / 2 ? 1 : x > this.elementWidth / 2 ? -1 : 0;
      }
      position =
        offset < this.elementWidth
          ? (position - 1 + children.length + condition) % children.length
          : (position - 2 + children.length + condition) % children.length;
      nextFrame(condition);
    });
  }

  render() {
    return (
      <div className="Swiper">
        <div className="Swiper-container">
          <div className="Swiper-item">1</div>
          <div className="Swiper-item">2</div>
          <div className="Swiper-item">3</div>
        </div>
      </div>
    );
  }
}
