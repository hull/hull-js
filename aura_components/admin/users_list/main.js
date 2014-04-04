/**
 *
 * Displays the list of users of your app.
 *
 * Access to this component is limited to the administrators, you will need to be logged in to your admin on hullapp.io to access data.
 *
 * @name Users List
 * @template {users}     Displays the list of the users.
 * @template {forbidden} A message to be displayed when the credentials don't allow access to the data
 * @datasource {users} The list of users (Only readable by admins)
 * @example <div data-hull-component="admin/users_list@hull"></div>
 */

Hull.component({
  type: 'Hull',

  templates: ['users_list'],

  refreshEvents: ['model.hull.me.change'],

  require: ['spin.min', 'ladda.min', 'bootstrap-modal', 'bootstrap-modalmanager', 'search', 'datagrid'],

  renderError: function(err) {
    if (err.message.status === 401) {
      this.html('You are not authorized to list users');
    }
  },

  datasources: {
    users: {
      provider: 'admin@:namespace',
      path: 'users/search',
      params: {
        search: ''
      }
    }
  },

  initialize: function() {
    this.query = {};
    this.currentQuery = {};
    this.injectLinkTag(this.options.baseUrl + '/ladda-themeless.min.css');
    this.injectLinkTag(this.options.baseUrl + '/bootstrap-modal.min.css');
    this.injectLinkTag(this.options.baseUrl + '/fuelux.min.css');
    this.injectLinkTag(this.options.baseUrl + '/fuelux-responsive.min.css');
    this.injectLinkTag(this.options.baseUrl + '/userlist.min.css');
  },

  /**
   *  @FIXME Duplicated from aura_components/login/shopify/main.js
   **/
  injectedLinkTags: {},
  injectLinkTag: function(url) {
    if (this.injectedLinkTags[url]) { return; }

    var e = document.createElement('link');
    e.href = url;
    e.rel = 'stylesheet';

    document.getElementsByTagName('head')[0].appendChild(e);

    this.injectedLinkTags[url] = true;
  },

  beforeRender: function(data){
    var datasource = this.datasources.users;
  },

  afterRender: function() {
    var $table = this.$el.find('.datagrid');
    var $btns = $table.find('.period button');
    $btns.filter('.default').addClass('active');
    $btns.on('click', function (e) {
      $(this).button('toggle');
      $table.datagrid('reload');
    });
    var self = this;
    var datasource = {
      columns: this.sandbox.util._.bind(this.columnConfig, this),
      data: function (options, callback) {
        var period = self.$el.find('button.active').prop('value');
        var ds = self.datasources.users;
        var trackingData = {
          page: ds.def.params.page,
          user_id: self.data.me.id
        };
        if (period === 'all') {
          ds.def.params.where = undefined;
        } else {
          var moment = self.sandbox.util.moment().startOf('day');
          switch(period) {
            case 'day':
              moment.subtract('days', 1);
              break;
            case 'week':
              moment.subtract('weeks', 1)
              break;
            case 'month':
              moment.subtract('months', 1);
              break;
          }
          ds.def.params.where = {
            created_at: {
              gte: moment.toDate().toISOString()
            }
          }
        }
        if (options.sortProperty) {
          var direction = options.sortDirection || '';
          trackingData.sortProperty = options.sortProperty;
          trackingData.sortDirection = direction;
          var oldSort = ds.def.params.order;
          ds.def.params.order = {};
          ds.def.params.order[options.sortProperty] = direction.toLowerCase();
          if (oldSort[options.sortProperty] !== direction.toLowerCase()) {
            self.sandbox.track('hull.admin.users_list.sort', trackingData);
          }
        } else {
          ds.def.params.order = { 'created_at': 'desc' };
        }
        if (options.search) {
          self.sandbox.track('hull.admin.users_list.search', {
            user_id: self.data.me.id,
            search: options.search
          });

          ds.def.params.search = options.search;
          trackingData.search = options.search;
        } else {
          ds.def.params.search = '*';
          ds.def.params.page = 1;
        }
        ds.def.params.page = (options.pageIndex || 0) + 1;
        ds.def.params.per_page = options.pageSize || 30;
        self.sandbox.track('hull.admin.users_list.pageview', trackingData);
        ds.fetch().then(function (obj) {
          var data = obj.get('data');
          var payload = {
            data: data,
            start: (obj.get('pagination').page - 1) * obj.get('pagination').per_page + 1,
            end: (obj.get('pagination').page - 1) * obj.get('pagination').per_page + data.length,
            count: obj.get('total'),
            pages: obj.get('pagination').pages,
            page: obj.get('pagination').page
          };
          callback(payload);
        });
      }
    };
    $table.datagrid({
      dataSource: datasource,
      enableSelect: true,
      primaryKey: 'id',
    }).on('loaded', function () {
      $table.find('a').on('click', function (e) {
        e.stopImmediatePropagation();
        e.stopPropagation();
      });
      Hull.parse(self.$el);
    }).on('itemSelected', function (evt, row) {
      self.sandbox.emit('hull.user.select', row.id);
      $table.datagrid('clearSelectedItems');
    });
  },

  columnConfig: function () {
    var self = this;
    return [{
      property: 'picture',
      label: '',
      sortable: false,
      render: function (value, row) {
        return $('<div>')
          .attr('data-hull-component', 'admin/user_avatar@hull')
          .attr('data-hull-avatar', value);
      }
    }, {
      property: 'name',
      label: 'Name',
      sortable: true,
      render: function (name, row) {
        if (!name && row.main_identity.toLowerCase() === 'guest') {
          name = 'Guest user';
        }
        var email = row.email || ''
        var $name = $('<p class="name">').text(name);
        var $email = $('<span class="email">');
        var $emailAnchor = $('<a>').attr('href', 'mailto:' + email).text(email);
        if (name) {
          if (!email) $email.hide();
          return [$name.text(name), $email.append($emailAnchor)];
        } else {
          return $name.html($emailAnchor);
        }
      }
    }, {
      property: 'created_at',
      label: 'Signed up since',
      sortable: true,
      render: function (value, row) {
        return self.sandbox.util.moment(value).fromNow();
      }
    }, {
      property: 'stats',
      label: 'Visits',
      sortable: false,
      render: function (stats, row) {
        var signInCount = 1 + parseInt(stats.sign_in_count || 0);
        var $total = $('<p>')
          .text('Total: ')
          .append($('<strong>').text(signInCount));
        var $latest = $('<small>').text('Latest: ').append($('<strong>').text(self.sandbox.util.moment(row.last_seen_at || row.created_at).fromNow()));

        return [$total, $latest];
      }
    }, {
      property: 'main_identity',
      label: 'Identities',
      sortable: false,
      render: function (value, row) {
        var providers = self.getLoginProviders(row);
        return self.sandbox.util._.map(providers, function (provider) {
          return $('<i>').addClass('icon-' + provider);
        });
      }
    }];
  },

  getLoginProviders: function (user) {
    var map = this.sandbox.util._.map;
    var self = this;
    var providers = [user.main_identity];
    map(user.identities, function (identity) {
      var provider = identity.provider;
      if (providers.indexOf(provider) === -1) {
        providers.push(provider);
      }
    });
    return providers;
  },

  actions: {
    selectUser: function(event, action) {
      this.sandbox.emit('hull.user.select', action.data.id);
    }
  },

  queryHasChanged: function() {
    var _ = this.sandbox.util._;

    if (_.isEmpty(this.query) && _.isEmpty(this.currentQuery)) { return false; }
    if (_.size(this.query) !== _.size(this.currentQuery)) { return true; }

    return !this.sandbox.util._.every(this.query, function(v, k) {
      return this.currentQuery[k] === v;
    }, this);
  },
});
