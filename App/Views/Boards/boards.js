﻿//NOTE: S.boards is available from all dashboard pages

S.boards = {
    add: {
        popup: null,
        boardId: null,
        callback: null,

        show: function (e, id, name, orgId, callback) {
            //get team list
            S.boards.add.boardId = id;
            S.boards.add.callback = callback;
            var hasid = false;
            if (id != null && id > 0) { hasid = true; }
            if (typeof name == 'function') { name = name(id, orgId);}
            S.ajax.post('Organizations/List', { security: 'board-create' }, function (data) {
                var view = new S.view(
                    $('#template_newboard').html()
                        .replace('#org-options#',
                        data.orgs.map(a => {
                            return '<option value="' + a.orgId + '"' +
                                (orgId != null ? (a.orgId == orgId ? ' selected' : '') : '') +
                                '>' + a.name + '</option>';
                        }).join(''))
                        .replace('#name#', name ? name : '')
                        .replace('#color#', '#0094ff')
                        .replace('#submit-label#', !hasid ? 'Create Board' : 'Update Board')
                        .replace('#submit-click#', !hasid ? 'S.boards.add.submit()' : 'S.boards.add.submit(\'' + id + '\')')
                    .replace('#org-name#', orgId ? data.orgs.filter(a => a.orgId == orgId)[0].name : '')
                    , {});
                var popup = S.popup.show(!hasid ? 'Create A New Board' : 'Edit Board Settings', view.render(), {
                    width: 430,
                    onClose: function () {
                        if (callback) { callback();}
                    }
                });
                S.boards.add.popup = popup;

                //when orgId is provided
                if (orgId) {
                    $('.board-form .choose-org').hide();
                    $('.board-form .chosen-org').removeClass('hide');
                }

                //button events
                $('.board-form .btn-add-org').on('click', () => {
                    popup.hide();
                    S.orgs.add.show(null, (result, id) => {
                        if (result == true) {
                            //reload list of organizations
                            S.ajax.post('Organizations/List', { security: 'board-create' }, function (data2) {
                                $('.board-form #orgId').html(data2.orgs.map(a => {
                                    return '<option value="' + a.orgId + '">' + a.name + '</option>';
                                }).join(''));
                            }, null, true);
                        }
                        popup.show();
                        S.popup.resize();
                    });
                });

                //load board details if id is supplied
                if (hasid) {
                    S.ajax.post('Boards/Details', { boardId: id }, function (data) {
                        $('#boardname').val(data.board.name);
                        $('.popup .color-input').css({ 'background-color': data.board.color });
                        $('#orgId').val(data.board.orgId);
                    }, null, true);
                }
                if (orgId != null && orgId > 0) {
                    $('#orgId').val(orgId);
                }
            }, null, true);
            if (e) { e.cancelBubble = true;}
            return false;
        },

        hide: function () {
            console.log('hide popup');
            if (typeof S.boards.add.callback != 'undefined') {
                S.boards.add.callback(null);
            }
            S.popup.hide(S.boards.add.popup);
        },

        submit: function (id) {
            var hasid = false;
            var name = $('#boardname').val();
            var color = S.util.color.rgbToHex($('.popup .color-input').css('background-color')).replace('#','');
            var orgId = $('#orgId').val();
            var msg = $('.popup.show .message');
            if (id > 0) { hasid = true;}
            if (name == '' || name == null) {
                S.message.show(msg, 'error', 'Please specify a board name');
                return;
            }
            var form = { name: name, color: color, orgId: orgId };
            if (hasid) { form.boardId = id; }
            S.ajax.post(hasid ? 'Boards/Update' : 'Boards/Create', form,
                function (data) {
                    console.log('updated/created board');
                    if (S.boards.add.callback != null) {
                        S.boards.add.callback(form);
                        S.popup.hide(S.boards.add.popup);
                    } else {
                        window.location.reload();
                    }
                },
                function () {
                    S.message.show(msg, 'error', S.message.error.generic);
                    return;
                }
            );
        },

        updated: function (data) {
            if (!data) { return; }
            if (data.color != null) {
                console.log(data);
                console.log('.board.board-' + data.boardId);
                console.log($('.board.board-' + data.boardId));
                $('.board.board-' + data.boardId).css({ 'background-color': '#' + data.color });
            }
            $('.board.board-' + data.boardId + ' .title').html(data.name);
        }
    },

    getTitle: function (boardId, orgId) {
        return  $('.board.board-' + boardId + ' .title').html().trim();
    },

    updateTeamList: function (orgId) {
        S.ajax.post('Teams/List', {orgId:orgId}, function (data) {
            $('#boardteam').html(
                data.teams.map(a => {
                    return '<option value="' + a.teamId + '">' + a.name + '</option>';
                }).join('')
            );
        }, null, true);
    },

    colorPicker: {
        callback:null,
        show: function (callback) {
            $('.board-form').hide();
            $('.color-picker').show();
            $('.color-picker .color').on('click', S.boards.colorPicker.select);
            S.boards.colorPicker.callback = callback;
            S.popup.resize();
        },

        hide: function () {
            $('.color-picker .color').off('click', S.boards.colorPicker.select);
            $('.color-picker').hide();
            $('.board-form').show();
            S.popup.resize();
        },

        select: function (e) {
            var elem = e.target;
            var color = S.util.color.rgbToHex($(elem).css('background-color'));
            $('.color-input').css({ 'background-color': color });
            S.boards.colorPicker.hide();
            if (typeof S.boards.colorPicker.callback == 'function') {
                S.boards.colorPicker.callback(color);
            }
        }
    }
};