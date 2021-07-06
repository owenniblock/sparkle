import React, {
  useState,
  RefObject,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
} from "react";
import classNames from "classnames";
import { useCss } from "react-use";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark as solidBookmark } from "@fortawesome/free-solid-svg-icons";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";
import { faExpandAlt as expandAlt } from "@fortawesome/free-solid-svg-icons";
import { faCompressAlt as compressAlt } from "@fortawesome/free-solid-svg-icons";
import { faSquare as squareIcon } from "@fortawesome/free-regular-svg-icons";

import { SCHEDULE_HOUR_COLUMN_WIDTH_PX } from "settings";

import {
  addEventToPersonalizedSchedule,
  removeEventFromPersonalizedSchedule,
} from "api/profile";

import { PersonalizedVenueEvent } from "types/venues";

import { isEventLive } from "utils/event";
import { getMinuteValue } from "utils/time";

import { useUser } from "hooks/useUser";
import { useShowHide } from "hooks/useShowHide";

import { EventModal } from "components/organisms/EventModal";
import { calcStartPosition } from "components/molecules/Schedule/utils";

import "./ScheduleEvent.scss";

const ScheduleEventBookmarkClass = "ScheduleEvent__bookmark";
const ScheduleEventExpandClass = "ScheduleEvent__expand";

const shortEventLength = 10;
const minLongEventLength = 15;
const longEventLength = 60;

export interface ScheduleEventProps {
  event: PersonalizedVenueEvent;
  scheduleStartHour: number;
  personalizedEvent?: boolean;
}

export const ScheduleEvent: React.FC<ScheduleEventProps> = ({
  event,
  scheduleStartHour,
  personalizedEvent: isPersonalizedEvent = false,
}) => {
  const eventRef: RefObject<HTMLDivElement> = useRef(null);
  const isLongEvent = event.duration_minutes >= minLongEventLength;
  const isShortEvent = event.duration_minutes <= shortEventLength;
  const { userId } = useUser();
  const [isExpanded, toggleExpanded] = useState(false);
  const [isExpandedStatic, toggleExpandedStatic] = useState(false);

  const isBookmarkDisplayed = isLongEvent || isExpanded || isExpandedStatic;
  const isContentDisplayed =
    isExpanded || isExpandedStatic || event.duration_minutes >= longEventLength;
  const isShowExpand = !isShortEvent || isExpanded;

  // @debt ONE_HOUR_IN_MINUTES is deprectated; refactor to use utils/time or date-fns functions
  const eventWidthPx = getMinuteValue(
    event.duration_minutes * SCHEDULE_HOUR_COLUMN_WIDTH_PX
  );

  const expandedEventPx = getMinuteValue(
    longEventLength * SCHEDULE_HOUR_COLUMN_WIDTH_PX
  );

  const eventMarginLeftPx = calcStartPosition(
    event.start_utc_seconds,
    scheduleStartHour
  );

  const containerCssVars = useCss({
    "--event--margin-left": `${eventMarginLeftPx}px`,
    "--event--width": `${eventWidthPx}px`,
    "--event--widen": `${expandedEventPx}px`,
  });

  const containerClasses = classNames(
    "ScheduleEvent",
    {
      "ScheduleEvent--live": isEventLive(event),
      "ScheduleEvent--users": isPersonalizedEvent,
      "ScheduleEvent--wide": isExpanded || isExpandedStatic,
    },
    containerCssVars
  );

  const bookmarkEvent: MouseEventHandler<HTMLDivElement> = useCallback(() => {
    if (!userId || !event.id) return;

    event.isSaved
      ? removeEventFromPersonalizedSchedule({ event, userId })
      : addEventToPersonalizedSchedule({ event, userId });
  }, [userId, event]);

  const {
    isShown: isEventModalVisible,
    show: showEventModal,
    hide: hideEventModal,
  } = useShowHide();

  const onEventBoxClick = useCallback(
    (e) => {
      if (
        e.target.closest(`.${ScheduleEventBookmarkClass}`) ||
        e.target.closest(`.${ScheduleEventExpandClass}`)
      )
        return;

      showEventModal();
    },
    [showEventModal]
  );

  const handleMouseOver = () => {
    if (isLongEvent) return;

    toggleExpanded(true);
  };

  const handleMouseOut = () => {
    if (isExpandedStatic) return;

    toggleExpanded(false);
  };

  const handleCollapse = useCallback(() => {
    toggleExpandedStatic(false);
    toggleExpanded(false);
  }, []);

  const handleToggleExpand = useCallback(() => {
    if (!isExpandedStatic) {
      toggleExpandedStatic(!isExpandedStatic);

      return;
    }

    handleCollapse();
  }, [isExpandedStatic, handleCollapse]);

  useEffect(() => {
    function handleClickOutside(event: Event) {
      const eventTarget = event.target as Node;
      if (
        eventRef.current &&
        !eventRef?.current?.contains(eventTarget) &&
        !isEventModalVisible
      ) {
        handleCollapse();
      }
    }

    window.addEventListener("mousedown", handleClickOutside, false);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside, false);
    };
  }, [eventRef, handleCollapse, isEventModalVisible]);

  return (
    <>
      <div
        ref={eventRef}
        className={containerClasses}
        onClick={onEventBoxClick}
        onMouseEnter={handleMouseOver}
        onMouseLeave={handleMouseOut}
      >
        {isShowExpand && (
          <div
            className={ScheduleEventExpandClass}
            onClick={handleToggleExpand}
          >
            <FontAwesomeIcon
              icon={squareIcon}
              className="ScheduleEvent__expand--square"
              style={{ width: "24px" }}
            />
            <FontAwesomeIcon
              icon={isExpandedStatic ? compressAlt : expandAlt}
              className="ScheduleEvent__expand--arrows"
              style={{ width: "24px" }}
            />
          </div>
        )}
        {isContentDisplayed && (
          <div className="ScheduleEvent__info">
            <div className="ScheduleEvent__title">{event.name}</div>
            <div className="ScheduleEvent__host">by {event.host}</div>
          </div>
        )}

        {isBookmarkDisplayed && (
          <div className={ScheduleEventBookmarkClass} onClick={bookmarkEvent}>
            <FontAwesomeIcon
              icon={event.isSaved ? solidBookmark : regularBookmark}
            />
          </div>
        )}
      </div>

      <EventModal
        show={isEventModalVisible}
        onHide={hideEventModal}
        event={event}
      />
    </>
  );
};
