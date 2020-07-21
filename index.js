module.exports = function (app) {
  var plugin = {};

  plugin.id = 'sk-opencharting-plugin';
  plugin.name = 'Shared Charts';
  plugin.description = 'Save trip data and generate GeoJSON contours';


  plugin.start = function (options, restartPlugin) {
    app.debug('Plugin started');
    let localSubscription = {
      context: 'self', // Get data for all contexts
      subscribe: [{
        path: '*', // Get all paths
        period: 1000 // Every 1000ms
      }]
    };

    app.subscriptionmanager.subscribe(
      localSubscription,
      unsubscribes,
      subscriptionError => {
        app.error('Error:' + subscriptionError);
      },
      delta => {
        delta.updates.forEach(u => {
          app.debug(u);
        });
      }
    );
  };
  plugin.stop = function () {
    // Here we put logic we need when the plugin stops
    app.debug('Plugin stopped');
  };

  plugin.schema = {
    // The plugin schema
  };

  return plugin;
};
