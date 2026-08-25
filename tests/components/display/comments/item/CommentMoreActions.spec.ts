import { mockI18n } from '@tests/mocks';
vi.mock('vue-i18n', () => mockI18n());

import CommentMoreActions from '@/components/display/comments/item/CommentMoreActions.vue';
import { emptyComment } from '@/stores/class/general/comment';
import { mount, setupAuthStore } from '@tests/utils';
import { describe, expect, it, vi } from 'vitest';

// Stands in for the real implementation that a consuming app (e.g.
// frontoffice) registers globally via app.component("CommentMoreActionsAdmin", ...).
const FakeCommentMoreActionsAdmin = {
    props: ['comment', 'actionsAdmin'],
    emits: ['update:comment', 'update:actionsAdmin'],
    template: `<div class="fake-comment-admin" :data-comment-id="comment?.commentId" :data-actions-admin="actionsAdmin">
        <button class="fake-comment-admin-update" @click="$emit('update:comment', { ...comment, content: 'edited' })" />
        <button class="fake-comment-admin-set-actions" @click="$emit('update:actionsAdmin', 'info')" />
    </div>`,
};

function mountComponent(globalComponents?: Record<string, unknown>) {
    return mount(CommentMoreActions, {
        props: { comment: { ...emptyComment(), commentId: 7 }, editRight: true },
        stubs: ['ClassicPopover'],
        globalComponents,
        beforeMount: setupAuthStore()
    });
}

describe('CommentMoreActions', () => {
    describe('CommentMoreActionsAdmin resolution', () => {
        it('passes the comment and actionsAdmin v-models to the globally registered component', async () => {
            const wrapper = await mountComponent({ CommentMoreActionsAdmin: FakeCommentMoreActionsAdmin });

            const admin = wrapper.find('.fake-comment-admin');
            expect(admin.exists()).toBe(true);
            expect(admin.attributes('data-comment-id')).toBe('7');
            expect(admin.attributes('data-actions-admin')).toBeUndefined();
        });

        it('threads comment updates from the admin component back out as update:comment', async () => {
            const wrapper = await mountComponent({ CommentMoreActionsAdmin: FakeCommentMoreActionsAdmin });

            await wrapper.find('.fake-comment-admin-update').trigger('click');

            expect(wrapper.emitted('update:comment')?.[0]).toEqual([
                { ...emptyComment(), commentId: 7, content: 'edited' }
            ]);
        });

        it('threads actionsAdmin updates from the admin component back into its own v-model prop', async () => {
            const wrapper = await mountComponent({ CommentMoreActionsAdmin: FakeCommentMoreActionsAdmin });

            await wrapper.find('.fake-comment-admin-set-actions').trigger('click');

            expect(wrapper.find('.fake-comment-admin').attributes('data-actions-admin')).toBe('info');
        });

        it('renders nothing where CommentMoreActionsAdmin would be when no global component is registered', async () => {
            const wrapper = await mountComponent();

            expect(wrapper.find('.fake-comment-admin').exists()).toBe(false);
        });

        it('is not rendered when editRight is false', async () => {
            const wrapper = await mount(CommentMoreActions, {
                props: { comment: { ...emptyComment(), commentId: 7 }, editRight: false },
                stubs: ['ClassicPopover'],
                globalComponents: { CommentMoreActionsAdmin: FakeCommentMoreActionsAdmin },
                beforeMount: setupAuthStore()
            });

            expect(wrapper.find('.fake-comment-admin').exists()).toBe(false);
        });
    });
});
