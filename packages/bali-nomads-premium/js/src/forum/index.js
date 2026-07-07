import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import DiscussionControls from 'flarum/forum/utils/DiscussionControls';
import Button from 'flarum/common/components/Button';
import CookForSocialsModal from './components/CookForSocialsModal';

app.initializers.add('visualmulia-bali-nomads-premium', () => {
  extend(DiscussionControls, 'moderationControls', function(items, discussion) {
    if (app.session.user && app.session.user.isAdmin()) {
      items.add('cook-for-socials', (
        <Button
          icon="fas fa-tools"
          onclick={() => app.modal.show(CookForSocialsModal, { discussion })}
        >
          🔧 Cook for Socials
        </Button>
      ));
    }
  });
});
