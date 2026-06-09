/// App-wide configuration.
///
/// The API base URL is configurable at runtime (Profile → Settings) so the same
/// build works on a physical device (LAN IP), iOS simulator / macOS (localhost),
/// or the Android emulator (10.0.2.2).
class AppConfig {
  /// Works out of the box on the same machine (web / macOS / iOS simulator).
  /// For a physical phone, switch to the LAN preset in Profile → Settings.
  static const String defaultBaseUrl = 'http://127.0.0.1:8000/api/v1';

  /// Handy presets shown in the settings screen.
  static const Map<String, String> presets = {
    'Web / macOS / iOS sim (localhost)': 'http://127.0.0.1:8000/api/v1',
    'Android emulator (10.0.2.2)': 'http://10.0.2.2:8000/api/v1',
    'Physical phone (LAN 10.35.48.19)': 'http://10.35.48.19:8000/api/v1',
  };

  /// Origin (without /api/v1) — used to resolve relative image/storage paths.
  static String originFrom(String baseUrl) {
    final i = baseUrl.indexOf('/api/');
    return i == -1 ? baseUrl : baseUrl.substring(0, i);
  }
}
