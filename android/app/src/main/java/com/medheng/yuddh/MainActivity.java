package com.medheng.yuddh;

import android.os.Bundle;
import android.view.WindowManager;

import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    // The game owns the whole screen: no status bar (clock, battery) over the buttons.
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    hideSystemBars();

    // The phone's own Back (button or swipe) presses the game's on-screen way back.
    // On the title screen there is nothing to go back to, so the app closes.
    getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
      @Override
      public void handleOnBackPressed() {
        getBridge().getWebView().evaluateJavascript(
          "(function(){try{return window.__yuddhBack?window.__yuddhBack():'exit'}catch(e){return 'exit'}})()",
          value -> { if (value == null || value.contains("exit")) finish(); });
      }
    });
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus) hideSystemBars();
  }

  /** Immersive: bars hidden; a swipe from the edge shows them briefly, then they hide again. */
  private void hideSystemBars() {
    WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
    c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    c.hide(WindowInsetsCompat.Type.systemBars());
  }
}
