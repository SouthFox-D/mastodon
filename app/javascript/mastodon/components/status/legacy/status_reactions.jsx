import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';

import { animated, useTransition } from '@react-spring/web';

import { AnimatedNumber } from '@/mastodon/components/animated_number';
import { Emoji } from '@/mastodon/components/emoji';
import { isUnicodeEmoji } from '@/mastodon/features/emoji/utils';
import { autoPlayGif, reduceMotion } from '@/mastodon/initial_state';

const StatusReactions = ({
  statusId,
  reactions,
  numVisible,
  addReaction,
  canReact,
  removeReaction,
}) => {
  const visibleReactions = useMemo(() => {
    let visible = reactions
      .filter(x => x.get('count') > 0)
      .sort((a, b) => b.get('count') - a.get('count'));

    if (numVisible >= 0) {
      visible = visible.filter((_, i) => i < numVisible);
    }

    return visible.toArray();
  }, [numVisible, reactions]);

  const transitions = useTransition(visibleReactions, {
    from: { scale: 0 },
    enter: { scale: 1 },
    leave: { scale: 0 },
    immediate: reduceMotion,
    keys: visibleReactions.map(x => x.get('name')),
  });

  return (
    <div className={classNames('reactions-bar', { 'reactions-bar--empty': visibleReactions.length === 0 })}>
      {transitions(({ scale }, reaction) => (
        <Reaction
          key={reaction.get('name')}
          statusId={statusId}
          reaction={reaction}
          style={{ transform: scale.to((s) => `scale(${s})`) }}
          addReaction={addReaction}
          removeReaction={removeReaction}
          canReact={canReact}
        />
      ))}
    </div>
  );
};

StatusReactions.propTypes = {
  statusId: PropTypes.string.isRequired,
  reactions: ImmutablePropTypes.list.isRequired,
  numVisible: PropTypes.number,
  addReaction: PropTypes.func,
  canReact: PropTypes.bool.isRequired,
  removeReaction: PropTypes.func,
};

const Reaction = ({
  reaction,
  statusId,
  addReaction,
  removeReaction,
  canReact,
  style,
}) => {
  const name = reaction.get('name');
  const url = reaction.get('url');
  const staticUrl = reaction.get('static_url');
  const me = reaction.get('me');

  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  const handleClick = useCallback(() => {
    if (!canReact) return;

    if (reaction.get('me') && removeReaction) {
      removeReaction(statusId, name);
    } else if (addReaction) {
      addReaction(statusId, name);
    }
  }, [canReact, reaction, removeReaction, addReaction, statusId, name]);

  const isCustom = !!url;

  return (
    <animated.button
      type='button'
      className={classNames('reactions-bar__item', { active: me })}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      <span className='reactions-bar__item__emoji'>
        {isCustom ? (
          <img
            draggable='false'
            className='emojione custom-emoji'
            alt={`:${name}:`}
            title={`:${name}:`}
            src={(autoPlayGif || hovered) ? url : staticUrl}
            loading='lazy'
          />
        ) : (
          <Emoji code={name} />
        )}
      </span>
      <span className='reactions-bar__item__count'>
        <AnimatedNumber value={reaction.get('count')} />
      </span>
    </animated.button>
  );
};

Reaction.propTypes = {
  statusId: PropTypes.string,
  reaction: ImmutablePropTypes.map.isRequired,
  addReaction: PropTypes.func,
  removeReaction: PropTypes.func,
  canReact: PropTypes.bool.isRequired,
  style: PropTypes.object,
};

export default StatusReactions;
