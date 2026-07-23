package com.fardin.studyhub;

import com.getcapacitor.BridgeActivity;

import android.os.Bundle;
import android.view.Display;
import android.view.WindowManager;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Force highest refresh rate for maximum FPS
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            Display.Mode[] modes = getWindowManager().getDefaultDisplay().getSupportedModes();
            if (modes != null && modes.length > 0) {
                Display.Mode maxMode = modes[0];
                for (Display.Mode mode : modes) {
                    if (mode.getRefreshRate() > maxMode.getRefreshRate()) {
                        maxMode = mode;
                    }
                }
                WindowManager.LayoutParams lp = getWindow().getAttributes();
                lp.preferredDisplayModeId = maxMode.getModeId();
                getWindow().setAttributes(lp);
            }
        }
    }
}
