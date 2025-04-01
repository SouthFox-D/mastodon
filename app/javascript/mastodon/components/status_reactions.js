import ImmutablePureComponent from 'react-immutable-pure-component';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { autoPlayGif, reduceMotion } from '../initial_state';
import classNames from 'classnames';
import { PureComponent, useMemo } from 'react';
import { animated, useTransition } from '@react-spring/web';
import { unicodeMapping } from '../features/emoji/emoji_unicode_mapping_light';
import { AnimatedNumber } from './animated_number';
import { assetHost } from '../utils/config';

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
    from: {
      scale: 0,
    },
    initial: {
      scale: 1,
    },
    enter: {
      scale: 1,
    },
    leave: {
      scale: 0,
    },
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

class Reaction extends ImmutablePureComponent {

  static propTypes = {
    statusId: PropTypes.string,
    reaction: ImmutablePropTypes.map.isRequired,
    addReaction: PropTypes.func.isRequired,
    removeReaction: PropTypes.func.isRequired,
    canReact: PropTypes.bool.isRequired,
    style: PropTypes.object,
  };

  state = {
    hovered: false,
  };

  handleClick = () => {
    const { reaction, statusId, addReaction, removeReaction } = this.props;

    if (reaction.get('me')) {
      removeReaction(statusId, reaction.get('name'));
    } else {
      if (reaction.get('name').indexOf('@') === -1) {
        addReaction(statusId, reaction.get('name'));
      }
    }
  }

  handleMouseEnter = () => this.setState({ hovered: true })

  handleMouseLeave = () => this.setState({ hovered: false })

  render() {
    const { reaction } = this.props;

    return (
      <animated.button
        type='button'
        className={classNames('reactions-bar__item', { active: reaction.get('me') })}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        disabled={!this.props.canReact}
        style={this.props.style}
      >
        <span className='reactions-bar__item__emoji'>
          <Emoji
            hovered={this.state.hovered}
            emoji={reaction.get('name')}
            url={reaction.get('url')}
            staticUrl={reaction.get('static_url')}
          />
        </span>
        <span className='reactions-bar__item__count'>
          <AnimatedNumber value={reaction.get('count')} />
        </span>
      </animated.button>
    );
  }

}

class Emoji extends PureComponent {

  static propTypes = {
    emoji: PropTypes.string.isRequired,
    hovered: PropTypes.bool.isRequired,
    url: PropTypes.string,
    staticUrl: PropTypes.string,
  };

  render() {
    const { emoji, hovered, url, staticUrl } = this.props;

    if (unicodeMapping[emoji]) {
      const { filename, shortCode } = unicodeMapping[this.props.emoji];
      const title = shortCode ? `:${shortCode}:` : '';

      return (
        <img
          draggable='false'
          className='emojione'
          alt={emoji}
          title={title}
          src={`${assetHost}/emoji/${filename}.svg`}
        />
      );
    } else {
      const filename = (autoPlayGif || hovered) ? url : staticUrl;
      const shortCode = `:${emoji}:`;

      return (
        <img
          draggable='false'
          className='emojione custom-emoji'
          alt={shortCode}
          title={shortCode}
          src={filename}
        />
      );
    }
  }

}

export default StatusReactions;
