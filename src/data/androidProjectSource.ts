export interface AndroidProjectFile {
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'markdown' | 'json' | 'yaml';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidProjectFile[] = [
  // 1. Gradle Version Catalog
  {
    path: 'gradle/libs.versions.toml',
    name: 'libs.versions.toml',
    language: 'groovy',
    description: 'Catálogo oficial de versiones de dependencias (AGP 8.3.2, Kotlin 1.9.23, Compose BOM, Media3 ExoPlayer 1.3.1 y Coil).',
    content: `[versions]
agp = "8.3.2"
kotlin = "1.9.23"
coreKtx = "1.12.0"
lifecycle = "2.7.0"
activityCompose = "1.8.2"
composeBom = "2024.04.01"
media3 = "1.3.1"
coil = "2.6.0"
coroutines = "1.8.0"
materialIcons = "1.6.5"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycle" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-compose-material-icons = { group = "androidx.compose.material", name = "material-icons-extended", version.ref = "materialIcons" }
androidx-media3-exoplayer = { group = "androidx.media3", name = "media3-exoplayer", version.ref = "media3" }
androidx-media3-session = { group = "androidx.media3", name = "media3-session", version.ref = "media3" }
androidx-media3-ui = { group = "androidx.media3", name = "media3-ui", version.ref = "media3" }
androidx-media3-common = { group = "androidx.media3", name = "media3-common", version.ref = "media3" }
coil-compose = { group = "io.coil-kt", name = "coil-compose", version.ref = "coil" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
`
  },

  // 2. Gradle Wrapper Configuration
  {
    path: 'gradle/wrapper/gradle-wrapper.properties',
    name: 'gradle-wrapper.properties',
    language: 'groovy',
    description: 'Configuración oficial de Gradle Wrapper 8.7 para ejecución sin necesidad de preinstalación manual.',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  },

  // 3. Root build.gradle.kts
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts (Root)',
    language: 'groovy',
    description: 'Archivo de compilación raíz de Gradle que registra los plugins de Android y Kotlin.',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`
  },

  // 4. settings.gradle.kts
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    language: 'groovy',
    description: 'Configuración de repositorios Google, Maven Central y definición del módulo :app para VyBORA.',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "VyBORA"
include(":app")
`
  },

  // 5. App Module build.gradle.kts
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts (app)',
    language: 'groovy',
    description: 'Configuración del módulo app con namespace com.vybora.musicplayer, compilación Release/Debug para APK/AAB y dependencias completas.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.vybora.musicplayer"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.vybora.musicplayer"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    signingConfigs {
        create("release") {
            // Utiliza la clave de depuración como fallback hasta configurar la keystore oficial de producción
            val debugKeystore = signingConfigs.getByName("debug")
            storeFile = debugKeystore.storeFile
            storePassword = debugKeystore.storePassword
            keyAlias = debugKeystore.keyAlias
            keyPassword = debugKeystore.keyPassword
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
        freeCompilerArgs += listOf(
            "-opt-in=androidx.compose.material3.ExperimentalMaterial3Api",
            "-opt-in=androidx.media3.common.util.UnstableApi"
        )
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.11"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons)

    // Android Media3 ExoPlayer
    implementation(libs.androidx.media3.exoplayer)
    implementation(libs.androidx.media3.session)
    implementation(libs.androidx.media3.ui)
    implementation(libs.androidx.media3.common)

    // Coil Image Loader para carátulas musicales
    implementation(libs.coil.compose)

    // Coroutines
    implementation(libs.kotlinx.coroutines.android)
}
`
  },

  // 6. ProGuard Rules
  {
    path: 'app/proguard-rules.pro',
    name: 'proguard-rules.pro',
    language: 'groovy',
    description: 'Reglas de ofuscación y optimización para compilaciones Release de Google Play.',
    content: `# Reglas ProGuard para VyBORA
# Conservar clases de ExoPlayer y MediaSession
-keep class androidx.media3.** { *; }
-dontwarn androidx.media3.**

# Conservar AudioFx nativos (Equalizer, Visualizer, BassBoost)
-keep class android.media.audiofx.** { *; }

# Conservar modelos de datos serializables
-keep class com.vybora.musicplayer.data.** { *; }

# Reglas generales de Compose y Coroutines
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.compose.runtime.Composable *;
}
`
  },

  // 7. GitHub Actions Workflow (Compilación automática en la nube de APK y AAB)
  {
    path: '.github/workflows/android-build.yml',
    name: 'android-build.yml (GitHub Actions)',
    language: 'yaml',
    description: 'Flujo de GitHub Actions para compilar automáticamente el APK Debug y el AAB Release de VyBORA en la nube y descargarlos directamente al teléfono.',
    content: `name: Compilar VyBORA APK y AAB

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch: # Permite compilar manualmente desde el navegador del móvil

jobs:
  build:
    name: Compilar APK y AAB
    runs-on: ubuntu-latest

    steps:
      - name: Descargar código fuente
        uses: actions/checkout@v4

      - name: Configurar Java 17 (Temurin)
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: Configurar Android SDK
        uses: android-actions/setup-android@v3

      - name: Permisos de ejecución para Gradle Wrapper
        run: chmod +x gradlew

      - name: Compilar APK de prueba (Debug)
        run: ./gradlew assembleDebug --stacktrace

      - name: Compilar Android App Bundle (Release AAB)
        run: ./gradlew bundleRelease --stacktrace

      - name: Subir APK instalable para el teléfono
        uses: actions/upload-artifact@v4
        with:
          name: VyBORA-v1.0-APK-Debug
          path: app/build/outputs/apk/debug/*.apk
          retention-days: 30

      - name: Subir AAB para Google Play Store
        uses: actions/upload-artifact@v4
        with:
          name: VyBORA-v1.0-AAB-Release
          path: app/build/outputs/bundle/release/*.aab
          retention-days: 30
`
  },

  // 8. AndroidManifest.xml
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    description: 'Manifiesto oficial de VyBORA con permisos para Android 13+ (READ_MEDIA_AUDIO), versiones anteriores, RECORD_AUDIO para visualizador y servicio de fondo.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.vybora.musicplayer">

    <!-- Permiso obligatorio para Android 13+ (API 33, Tiramisu y posteriores Android 14/15) -->
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />

    <!-- Permiso para Android 12 e inferiores (API 32 o menor) -->
    <uses-permission
        android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />

    <!-- Permiso para notificaciones de reproducción en barra de estado y bloqueo (Android 13+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Permisos para reproducción ininterrumpida en segundo plano y wake lock -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Permiso necesario para captura de FFT en tiempo real con android.media.audiofx.Visualizer -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.VyBORA">

        <!-- Actividad Principal con Compose -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.VyBORA"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Abrir archivos de audio directamente desde el explorador del dispositivo -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="audio/*" />
            </intent-filter>
        </activity>

        <!-- Servicio de Reproducción Nativa Jetpack Media3 ExoPlayer -->
        <service
            android:name=".playback.PlaybackService"
            android:foregroundServiceType="mediaPlayback"
            android:exported="true">
            <intent-filter>
                <action android:name="androidx.media3.session.MediaSessionService" />
                <action android:name="android.media.browse.MediaBrowserService" />
            </intent-filter>
        </service>

    </application>
</manifest>`
  },

  // 8. strings.xml
  {
    path: 'app/src/main/res/values/strings.xml',
    name: 'strings.xml',
    language: 'xml',
    description: 'Valores oficiales de VyBORA con créditos de Kenier Bravo y textos de interfaz.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">VyBORA</string>
    <string name="app_creator">Kenier Bravo</string>
    <string name="app_version">1.0</string>
    <string name="app_copyright">© 2026 Kenier Bravo. Todos los derechos reservados.</string>
    <string name="scan_music">Escanear Música</string>
    <string name="library_title">Biblioteca Musical</string>
    <string name="now_playing">Reproduciendo</string>
    <string name="equalizer_title">Ecualizador</string>
    <string name="settings_title">Ajustes</string>
</resources>`
  },

  // 9. colors.xml
  {
    path: 'app/src/main/res/values/colors.xml',
    name: 'colors.xml',
    language: 'xml',
    description: 'Paleta de colores oficial AMOLED Black (#000000) y morado neón eléctrico (#A855F7, #06B6D4).',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Fondo AMOLED Negro Absoluto para icono adaptativo y sistema -->
    <color name="ic_launcher_background">#000000</color>
    <color name="amoled_black">#000000</color>
    <color name="amoled_surface">#08080C</color>
    <color name="amoled_card">#120D1D</color>

    <!-- Colores oficiales neón y acentos luminosos de VyBORA -->
    <color name="vybora_purple">#A855F7</color>
    <color name="vybora_cyan">#06B6D4</color>
    <color name="vybora_fuchsia">#EC4899</color>
    <color name="text_primary">#F8FAFC</color>
    <color name="text_secondary">#94A3B8</color>
</resources>`
  },

  // 10. themes.xml
  {
    path: 'app/src/main/res/values/themes.xml',
    name: 'themes.xml',
    language: 'xml',
    description: 'Tema nativo Theme.VyBORA con barra de estado oscura y barra de navegación AMOLED transparente.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.VyBORA" parent="android:Theme.Material.NoActionBar">
        <item name="android:windowBackground">@color/amoled_black</item>
        <item name="android:statusBarColor">@color/amoled_black</item>
        <item name="android:navigationBarColor">@color/amoled_black</item>
        <item name="android:windowLightStatusBar">false</item>
    </style>
</resources>`
  },

  // 11. ic_launcher.xml
  {
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
    name: 'ic_launcher.xml',
    language: 'xml',
    description: 'Icono adaptativo oficial para Android 8.0+ (API 26+) con fondo negro AMOLED y logotipo oficial VyBORA.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@drawable/logo_vybora" />
</adaptive-icon>`
  },

  // 12. ic_launcher_round.xml
  {
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
    name: 'ic_launcher_round.xml',
    language: 'xml',
    description: 'Icono adaptativo circular para launchers de Android compatibles (Pixel, Samsung One UI, Xiaomi).',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@drawable/logo_vybora" />
</adaptive-icon>`
  },

  // 13. Native Models
  {
    path: 'app/src/main/java/com/vybora/musicplayer/data/NativeModels.kt',
    name: 'NativeModels.kt',
    language: 'kotlin',
    description: 'Modelos de datos para canciones reales escaneadas, álbumes, artistas, carpetas y configuración.',
    content: `package com.vybora.musicplayer.data

import android.net.Uri

data class NativeTrack(
    val id: Long,
    val title: String,
    val artist: String,
    val album: String,
    val duration: Long,
    val contentUri: Uri,
    val albumArtUri: Uri?,
    val folderName: String,
    val mimeType: String,
    val size: Long,
    val dateAdded: Long,
    val storageType: String // "Interno" o "Tarjeta SD"
)

data class NativeAlbum(
    val name: String,
    val artist: String,
    val albumArtUri: Uri?,
    val trackCount: Int,
    val tracks: List<NativeTrack>
)

data class NativeArtist(
    val name: String,
    val trackCount: Int,
    val tracks: List<NativeTrack>
)

data class NativeFolder(
    val name: String,
    val path: String,
    val trackCount: Int,
    val tracks: List<NativeTrack>
)

data class ScannedLibrary(
    val tracks: List<NativeTrack> = emptyList(),
    val albums: List<NativeAlbum> = emptyList(),
    val artists: List<NativeArtist> = emptyList(),
    val folders: List<NativeFolder> = emptyList()
)

enum class NativeRepeatMode {
    OFF, ALL, ONE
}
`
  },

  // 14. AudioScanner.kt
  {
    path: 'app/src/main/java/com/vybora/musicplayer/data/AudioScanner.kt',
    name: 'AudioScanner.kt',
    language: 'kotlin',
    description: 'Escáner automático de MediaStore para memoria interna y tarjetas SD externas con deduplicación.',
    content: `package com.vybora.musicplayer.data

import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

class AudioScanner(private val context: Context) {

    suspend fun scanDeviceAudio(): ScannedLibrary = withContext(Dispatchers.IO) {
        val trackList = mutableListOf<NativeTrack>()
        val seenTrackKeys = mutableSetOf<String>()

        val projection = arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.TITLE,
            MediaStore.Audio.Media.ARTIST,
            MediaStore.Audio.Media.ALBUM,
            MediaStore.Audio.Media.ALBUM_ID,
            MediaStore.Audio.Media.DURATION,
            MediaStore.Audio.Media.MIME_TYPE,
            MediaStore.Audio.Media.SIZE,
            MediaStore.Audio.Media.DATA,
            MediaStore.Audio.Media.DATE_ADDED
        )

        val selection = "\${MediaStore.Audio.Media.IS_MUSIC} != 0 AND \${MediaStore.Audio.Media.DURATION} >= 10000"
        val sortOrder = "\${MediaStore.Audio.Media.TITLE} ASC"

        val volumesToScan = mutableListOf<Uri>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val volumeNames = MediaStore.getExternalVolumeNames(context)
            for (volumeName in volumeNames) {
                volumesToScan.add(MediaStore.Audio.Media.getContentUri(volumeName))
            }
        } else {
            volumesToScan.add(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI)
            volumesToScan.add(MediaStore.Audio.Media.INTERNAL_CONTENT_URI)
        }

        for (volumeUri in volumesToScan) {
            try {
                context.contentResolver.query(
                    volumeUri,
                    projection,
                    selection,
                    null,
                    sortOrder
                )?.use { cursor ->
                    val idCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
                    val titleCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
                    val artistCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
                    val albumCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
                    val albumIdCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID)
                    val durationCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
                    val mimeCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.MIME_TYPE)
                    val sizeCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE)
                    val dataCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA)
                    val dateAddedCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATE_ADDED)

                    while (cursor.moveToNext()) {
                        val id = cursor.getLong(idCol)
                        val title = cursor.getString(titleCol)?.trim() ?: "Pista desconocida"
                        val artist = cursor.getString(artistCol)?.trim() ?: "Artista desconocido"
                        val album = cursor.getString(albumCol)?.trim() ?: "Álbum desconocido"
                        val albumId = cursor.getLong(albumIdCol)
                        val duration = cursor.getLong(durationCol)
                        val mimeType = cursor.getString(mimeCol) ?: "audio/mpeg"
                        val size = cursor.getLong(sizeCol)
                        val filePath = cursor.getString(dataCol) ?: ""
                        val dateAdded = cursor.getLong(dateAddedCol)

                        val uniqueKey = "\${title.lowercase()}_\${artist.lowercase()}_\${duration / 1000}"
                        if (seenTrackKeys.contains(uniqueKey)) continue
                        seenTrackKeys.add(uniqueKey)

                        val contentUri = ContentUris.withAppendedId(volumeUri, id)
                        val albumArtUri = if (albumId > 0) {
                            ContentUris.withAppendedId(
                                Uri.parse("content://media/external/audio/albumart"),
                                albumId
                            )
                        } else null

                        val folderName = try {
                            if (filePath.isNotEmpty()) File(filePath).parentFile?.name ?: "Música" else "Música"
                        } catch (e: Exception) {
                            "Música"
                        }

                        val storageType = if (filePath.contains("emulated/0")) "Almacenamiento Interno" else "Tarjeta SD / Externo"

                        trackList.add(
                            NativeTrack(
                                id = id,
                                title = title,
                                artist = artist,
                                album = album,
                                duration = duration,
                                contentUri = contentUri,
                                albumArtUri = albumArtUri,
                                folderName = folderName,
                                mimeType = mimeType,
                                size = size,
                                dateAdded = dateAdded,
                                storageType = storageType
                            )
                        )
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        val albums = trackList.groupBy { it.album }.map { (albumName, songs) ->
            NativeAlbum(
                name = albumName,
                artist = songs.firstOrNull()?.artist ?: "Varios Artistas",
                albumArtUri = songs.firstOrNull()?.albumArtUri,
                trackCount = songs.size,
                tracks = songs
            )
        }.sortedBy { it.name.lowercase() }

        val artists = trackList.groupBy { it.artist }.map { (artistName, songs) ->
            NativeArtist(
                name = artistName,
                trackCount = songs.size,
                tracks = songs
            )
        }.sortedBy { it.name.lowercase() }

        val folders = trackList.groupBy { it.folderName }.map { (folderName, songs) ->
            NativeFolder(
                name = folderName,
                path = folderName,
                trackCount = songs.size,
                tracks = songs
            )
        }.sortedBy { it.name.lowercase() }

        ScannedLibrary(tracks = trackList, albums = albums, artists = artists, folders = folders)
    }
}
`
  },

  // 15. MediaStoreAudioObserver.kt
  {
    path: 'app/src/main/java/com/vybora/musicplayer/data/MediaStoreAudioObserver.kt',
    name: 'MediaStoreAudioObserver.kt',
    language: 'kotlin',
    description: 'Observador reactivo en tiempo real de MediaStore para recargar canciones al descargarlas o borrarlas.',
    content: `package com.vybora.musicplayer.data

import android.database.ContentObserver
import android.net.Uri
import android.os.Handler
import android.os.Looper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class MediaStoreAudioObserver(
    private val onMediaStoreChanged: () -> Unit
) : ContentObserver(Handler(Looper.getMainLooper())) {

    private var debounceJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Main)

    override fun onChange(selfChange: Boolean, uri: Uri?) {
        super.onChange(selfChange, uri)
        debounceJob?.cancel()
        debounceJob = scope.launch {
            delay(1200) // Espera a que termine la escritura del archivo
            onMediaStoreChanged()
        }
    }
}
`
  },

  // 16. AudioEqualizerManager.kt
  {
    path: 'app/src/main/java/com/vybora/musicplayer/audiofx/AudioEqualizerManager.kt',
    name: 'AudioEqualizerManager.kt',
    language: 'kotlin',
    description: 'Controlador de hardware DSP de Android (Equalizer de 5 bandas, BassBoost y Virtualizer).',
    content: `package com.vybora.musicplayer.audiofx

import android.media.audiofx.BassBoost
import android.media.audiofx.Equalizer
import android.media.audiofx.Virtualizer

class AudioEqualizerManager(private val audioSessionId: Int) {

    var equalizer: Equalizer? = null
        private set
    var bassBoost: BassBoost? = null
        private set
    var virtualizer: Virtualizer? = null
        private set

    init {
        try {
            if (audioSessionId != 0) {
                equalizer = Equalizer(0, audioSessionId).apply { enabled = true }
                bassBoost = BassBoost(0, audioSessionId).apply { enabled = true }
                virtualizer = Virtualizer(0, audioSessionId).apply { enabled = true }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun setBandGain(bandIndex: Short, gainDecibels: Float) {
        val millibels = (gainDecibels * 100).toInt().coerceIn(-1200, 1200).toShort()
        equalizer?.setBandLevel(bandIndex, millibels)
    }

    fun setBassBoost(strengthPercent: Int) {
        val clamped = (strengthPercent * 10).coerceIn(0, 1000).toShort()
        bassBoost?.setStrength(clamped)
    }

    fun setVirtualizer(strengthPercent: Int) {
        val clamped = (strengthPercent * 10).coerceIn(0, 1000).toShort()
        virtualizer?.setStrength(clamped)
    }

    fun release() {
        equalizer?.release()
        bassBoost?.release()
        virtualizer?.release()
    }
}
`
  },

  // 17. VisualizerManager.kt
  {
    path: 'app/src/main/java/com/vybora/musicplayer/audiofx/VisualizerManager.kt',
    name: 'VisualizerManager.kt',
    language: 'kotlin',
    description: 'Gestor del Visualizer nativo de Android (android.media.audiofx.Visualizer) para capturar el espectro FFT en tiempo real.',
    content: `package com.vybora.musicplayer.audiofx

import android.media.audiofx.Visualizer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.math.hypot

class VisualizerManager(private val audioSessionId: Int) {

    private var visualizer: Visualizer? = null

    // Flujo del espectro de frecuencias normalizadas (0.0f a 1.0f)
    private val _frequencies = MutableStateFlow(FloatArray(48) { 0f })
    val frequencies = _frequencies.asStateFlow()

    fun start() {
        try {
            if (audioSessionId == 0) return
            visualizer = Visualizer(audioSessionId).apply {
                captureSize = Visualizer.getCaptureSizeRange()[1]
                setDataCaptureListener(
                    object : Visualizer.OnDataCaptureListener {
                        override fun onWaveFormDataCapture(v: Visualizer?, waveform: ByteArray?, samplingRate: Int) {}

                        override fun onFftDataCapture(v: Visualizer?, fft: ByteArray?, samplingRate: Int) {
                            fft ?: return
                            val n = fft.size / 2
                            val output = FloatArray(48)
                            for (i in 0 until 48) {
                                val idx = (i * (n / 48)).coerceIn(1, n - 1) * 2
                                val r = fft[idx].toFloat()
                                val im = fft[idx + 1].toFloat()
                                val mag = hypot(r, im) / 128f
                                output[i] = mag.coerceIn(0f, 1f)
                            }
                            _frequencies.value = output
                        }
                    },
                    Visualizer.getMaxCaptureRate() / 2,
                    false,
                    true
                )
                enabled = true
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun stop() {
        try {
            visualizer?.enabled = false
            visualizer?.release()
            visualizer = null
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
`
  },

  // 18. PlaybackService.kt
  {
    path: 'app/src/main/java/com/vybora/musicplayer/playback/PlaybackService.kt',
    name: 'PlaybackService.kt',
    language: 'kotlin',
    description: 'Servicio MediaSessionService de Jetpack Media3 con ExoPlayer para reproducción nativa en segundo plano.',
    content: `package com.vybora.musicplayer.playback

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import com.vybora.musicplayer.MainActivity
import com.vybora.musicplayer.audiofx.AudioEqualizerManager

class PlaybackService : MediaSessionService() {

    private var player: ExoPlayer? = null
    private var mediaSession: MediaSession? = null
    var equalizerManager: AudioEqualizerManager? = null
        private set

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()

        val audioAttributes = AudioAttributes.Builder()
            .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
            .setUsage(C.USAGE_MEDIA)
            .build()

        player = ExoPlayer.Builder(this)
            .setAudioAttributes(audioAttributes, true)
            .setHandleAudioBecomingNoisy(true)
            .setWakeMode(C.WAKE_MODE_LOCAL)
            .build().apply {
                repeatMode = Player.REPEAT_MODE_ALL
            }

        // Conectar ecualizador por hardware
        val audioSessionId = player?.audioSessionId ?: 0
        if (audioSessionId != 0) {
            equalizerManager = AudioEqualizerManager(audioSessionId)
        }

        val activityIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            activityIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        mediaSession = MediaSession.Builder(this, player!!)
            .setSessionActivity(pendingIntent)
            .build()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? {
        return mediaSession
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "vybora_playback_channel",
                "VyBORA Reproducción",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Controles de reproducción multimedia en barra de estado y pantalla de bloqueo"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        equalizerManager?.release()
        player?.release()
        mediaSession?.run {
            player.release()
            release()
            mediaSession = null
        }
        super.onDestroy()
    }
}
`
  },

  // 19. Theme Colors
  {
    path: 'app/src/main/java/com/vybora/musicplayer/ui/theme/Color.kt',
    name: 'Color.kt',
    language: 'kotlin',
    description: 'Definición de colores Material 3 para el tema negro AMOLED y acentos morado neón eléctrico de VyBORA.',
    content: `package com.vybora.musicplayer.ui.theme

import androidx.compose.ui.graphics.Color

val AmoledBlack = Color(0xFF000000)
val AmoledSurface = Color(0xFF0A0A10)
val AmoledCard = Color(0xFF130E20)
val AmoledCardBorder = Color(0x33A855F7)

val VyBoraPurple = Color(0xFFA855F7)
val VyBoraPurpleDark = Color(0xFF7E22CE)
val VyBoraCyan = Color(0xFF06B6D4)
val VyBoraFuchsia = Color(0xFFEC4899)

val TextPrimary = Color(0xFFF8FAFC)
val TextSecondary = Color(0xFF94A3B8)
val TextMuted = Color(0xFF64748B)
`
  },

  // 20. Theme.kt
  {
    path: 'app/src/main/java/com/vybora/musicplayer/ui/theme/Theme.kt',
    name: 'Theme.kt',
    language: 'kotlin',
    description: 'Tema principal VyBORATheme configurado en modo oscuro AMOLED con tipografías y colores neón.',
    content: `package com.vybora.musicplayer.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = VyBoraPurple,
    secondary = VyBoraCyan,
    tertiary = VyBoraFuchsia,
    background = AmoledBlack,
    surface = AmoledSurface,
    onPrimary = AmoledBlack,
    onSecondary = AmoledBlack,
    onBackground = TextPrimary,
    onSurface = TextPrimary
)

@Composable
fun VyBORATheme(content: @Composable () -> Unit) {
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = AmoledBlack.toArgb()
            window.navigationBarColor = AmoledBlack.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = false
        }
    }

    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
`
  },

  // 21. MainAppScreen.kt
  {
    path: 'app/src/main/java/com/vybora/musicplayer/ui/screens/MainAppScreen.kt',
    name: 'MainAppScreen.kt',
    language: 'kotlin',
    description: 'Estructura principal con barra de navegación inferior (Inicio, Biblioteca, Ecualizador, Ajustes) y reproductor persistente.',
    content: `package com.vybora.musicplayer.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.vybora.musicplayer.data.NativeTrack
import com.vybora.musicplayer.data.ScannedLibrary
import com.vybora.musicplayer.ui.theme.*

@Composable
fun MainAppScreen(
    library: ScannedLibrary,
    currentTrack: NativeTrack?,
    isPlaying: Boolean,
    onPlayTrack: (NativeTrack) -> Unit,
    onTogglePlay: () -> Unit,
    onNext: () -> Unit,
    onPrev: () -> Unit,
    onRescanClick: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(0) }
    var isFullPlayerVisible by remember { mutableStateOf(false) }

    Scaffold(
        bottomBar = {
            Column(modifier = Modifier.background(AmoledBlack)) {
                // Mini reproductor flotante
                if (currentTrack != null) {
                    MiniPlayer(
                        track = currentTrack,
                        isPlaying = isPlaying,
                        onTogglePlay = onTogglePlay,
                        onNext = onNext,
                        onClick = { isFullPlayerVisible = true }
                    )
                }

                NavigationBar(
                    containerColor = AmoledBlack,
                    contentColor = VyBoraPurple
                ) {
                    NavigationBarItem(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        icon = { Icon(Icons.Default.Home, contentDescription = "Inicio") },
                        label = { Text("Inicio", fontSize = 11.sp) }
                    )
                    NavigationBarItem(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        icon = { Icon(Icons.Default.LibraryMusic, contentDescription = "Biblioteca") },
                        label = { Text("Biblioteca", fontSize = 11.sp) }
                    )
                    NavigationBarItem(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        icon = { Icon(Icons.Default.Equalizer, contentDescription = "Ecualizador") },
                        label = { Text("Ecualizador", fontSize = 11.sp) }
                    )
                    NavigationBarItem(
                        selected = selectedTab == 3,
                        onClick = { selectedTab = 3 },
                        icon = { Icon(Icons.Default.Settings, contentDescription = "Ajustes") },
                        label = { Text("Ajustes", fontSize = 11.sp) }
                    )
                }
            }
        },
        containerColor = AmoledBlack
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (selectedTab) {
                0 -> HomeScreen(
                    library = library,
                    currentTrack = currentTrack,
                    isPlaying = isPlaying,
                    onPlayTrack = onPlayTrack,
                    onScanClick = onRescanClick
                )
                1 -> LibraryScreen(
                    library = library,
                    currentTrack = currentTrack,
                    onPlayTrack = onPlayTrack
                )
                2 -> EqualizerScreen()
                3 -> SettingsScreen(onRescanClick = onRescanClick)
            }

            // Reproductor completo fullscreen modal
            if (isFullPlayerVisible && currentTrack != null) {
                PlayerScreen(
                    track = currentTrack,
                    isPlaying = isPlaying,
                    onTogglePlay = onTogglePlay,
                    onNext = onNext,
                    onPrev = onPrev,
                    onClose = { isFullPlayerVisible = false }
                )
            }
        }
    }
}

@Composable
fun MiniPlayer(
    track: NativeTrack,
    isPlaying: Boolean,
    onTogglePlay: () -> Unit,
    onNext: () -> Unit,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 4.dp)
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onClick),
        color = AmoledCard,
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(8.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            AsyncImage(
                model = track.albumArtUri,
                contentDescription = track.title,
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(VyBoraPurpleDark)
            )

            Spacer(modifier = Modifier.width(10.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(track.title, color = TextPrimary, fontSize = 13.sp, maxLines = 1)
                Text(track.artist, color = TextSecondary, fontSize = 11.sp, maxLines = 1)
            }

            IconButton(onClick = onTogglePlay) {
                Icon(
                    imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                    contentDescription = "Reproducir/Pausar",
                    tint = VyBoraPurple
                )
            }

            IconButton(onClick = onNext) {
                Icon(Icons.Default.SkipNext, contentDescription = "Siguiente", tint = TextSecondary)
            }
        }
    }
}
`
  },

  // 22. HomeScreen.kt
  {
    path: 'app/src/main/java/com/vybora/musicplayer/ui/screens/HomeScreen.kt',
    name: 'HomeScreen.kt',
    language: 'kotlin',
    description: 'Pantalla de Inicio con banner oficial de VyBORA, logotipo neón, saludo y canciones destacadas.',
    content: `package com.vybora.musicplayer.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.vybora.musicplayer.data.NativeTrack
import com.vybora.musicplayer.data.ScannedLibrary
import com.vybora.musicplayer.ui.theme.*

@Composable
fun HomeScreen(
    library: ScannedLibrary,
    currentTrack: NativeTrack?,
    isPlaying: Boolean,
    onPlayTrack: (NativeTrack) -> Unit,
    onScanClick: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Banner oficial superior de VyBORA
        item {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                color = AmoledCard,
                border = androidx.compose.foundation.BorderStroke(1.dp, AmoledCardBorder)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(
                                Brush.linearGradient(listOf(VyBoraPurple, VyBoraCyan))
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("V", color = TextPrimary, fontSize = 28.sp)
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text("VyBORA", color = TextPrimary, fontSize = 22.sp)
                        Text(
                            "Reproductor Musical Premium",
                            color = VyBoraCyan,
                            fontSize = 12.sp
                        )
                        Text(
                            "\${library.tracks.size} canciones en memoria interna y SD",
                            color = TextSecondary,
                            fontSize = 11.sp
                        )
                    }

                    IconButton(onClick = onScanClick) {
                        Icon(Icons.Default.Refresh, contentDescription = "Escanear", tint = VyBoraPurple)
                    }
                }
            }
        }

        item {
            Text("Canciones Recientes", color = TextPrimary, fontSize = 18.sp)
        }

        items(library.tracks.take(20)) { track ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .clickable { onPlayTrack(track) }
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                AsyncImage(
                    model = track.albumArtUri,
                    contentDescription = track.title,
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(AmoledSurface)
                )

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        track.title,
                        color = if (currentTrack?.id == track.id) VyBoraPurple else TextPrimary,
                        fontSize = 14.sp,
                        maxLines = 1
                    )
                    Text(track.artist + " · " + track.album, color = TextSecondary, fontSize = 12.sp, maxLines = 1)
                }

                Icon(Icons.Default.PlayArrow, contentDescription = null, tint = TextMuted)
            }
        }
    }
}
`
  },

  // 23. LibraryScreen.kt (con barra de búsqueda en tiempo real)
  {
    path: 'app/src/main/java/com/vybora/musicplayer/ui/screens/LibraryScreen.kt',
    name: 'LibraryScreen.kt',
    language: 'kotlin',
    description: 'Biblioteca musical completa con barra de búsqueda en tiempo real por título, artista o álbum, y subpestañas.',
    content: `package com.vybora.musicplayer.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.vybora.musicplayer.data.NativeTrack
import com.vybora.musicplayer.data.ScannedLibrary
import com.vybora.musicplayer.ui.theme.*

@Composable
fun LibraryScreen(
    library: ScannedLibrary,
    currentTrack: NativeTrack?,
    onPlayTrack: (NativeTrack) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedSubTab by remember { mutableStateOf(0) } // 0: Canciones, 1: Álbumes, 2: Artistas, 3: Carpetas

    val filteredTracks = remember(library.tracks, searchQuery) {
        if (searchQuery.isBlank()) library.tracks
        else {
            val q = searchQuery.trim().lowercase()
            library.tracks.filter {
                it.title.lowercase().contains(q) ||
                it.artist.lowercase().contains(q) ||
                it.album.lowercase().contains(q)
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Barra de búsqueda en tiempo real
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Buscar por título, artista o álbum...", color = TextMuted) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = VyBoraPurple) },
            trailingIcon = {
                if (searchQuery.isNotEmpty()) {
                    IconButton(onClick = { searchQuery = "" }) {
                        Icon(Icons.Default.Close, contentDescription = "Limpiar", tint = TextSecondary)
                    }
                }
            },
            shape = RoundedCornerShape(16.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = VyBoraPurple,
                unfocusedBorderColor = AmoledCardBorder,
                focusedContainerColor = AmoledCard,
                unfocusedContainerColor = AmoledCard
            ),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Pestañas
        TabRow(
            selectedTabIndex = selectedSubTab,
            containerColor = AmoledBlack,
            contentColor = VyBoraPurple
        ) {
            Tab(selected = selectedSubTab == 0, onClick = { selectedSubTab = 0 }, text = { Text("Canciones (\${filteredTracks.size})") })
            Tab(selected = selectedSubTab == 1, onClick = { selectedSubTab = 1 }, text = { Text("Álbumes") })
            Tab(selected = selectedSubTab == 2, onClick = { selectedSubTab = 2 }, text = { Text("Artistas") })
            Tab(selected = selectedSubTab == 3, onClick = { selectedSubTab = 3 }, text = { Text("Carpetas") })
        }

        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredTracks) { track ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .clickable { onPlayTrack(track) }
                        .padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AsyncImage(
                        model = track.albumArtUri,
                        contentDescription = track.title,
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(AmoledSurface)
                    )

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            track.title,
                            color = if (currentTrack?.id == track.id) VyBoraPurple else TextPrimary,
                            fontSize = 14.sp,
                            maxLines = 1
                        )
                        Text(track.artist + " · " + track.album, color = TextSecondary, fontSize = 12.sp, maxLines = 1)
                    }
                }
            }
        }
    }
}
`
  },

  // 24. PlayerScreen.kt (con visualizador de espectro neón fluido en Compose)
  {
    path: 'app/src/main/java/com/vybora/musicplayer/ui/screens/PlayerScreen.kt',
    name: 'PlayerScreen.kt',
    language: 'kotlin',
    description: 'Reproductor fullscreen AMOLED con carátula grande, barra de progreso, controles y Visualizador de Espectro Neón Fluido.',
    content: `package com.vybora.musicplayer.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.vybora.musicplayer.data.NativeTrack
import com.vybora.musicplayer.ui.theme.*
import kotlin.math.sin

@Composable
fun PlayerScreen(
    track: NativeTrack,
    isPlaying: Boolean,
    onTogglePlay: () -> Unit,
    onNext: () -> Unit,
    onPrev: () -> Unit,
    onClose: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(AmoledBlack)
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Cabecera
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onClose) {
                    Icon(Icons.Default.KeyboardArrowDown, contentDescription = "Cerrar", tint = TextPrimary)
                }

                Text("VyBORA Player", color = VyBoraPurple, fontSize = 14.sp)

                IconButton(onClick = {}) {
                    Icon(Icons.Default.MoreVert, contentDescription = null, tint = TextPrimary)
                }
            }

            // Carátula grande
            AsyncImage(
                model = track.albumArtUri,
                contentDescription = track.title,
                modifier = Modifier
                    .size(280.dp)
                    .clip(RoundedCornerShape(32.dp))
                    .background(AmoledCard)
            )

            // Visualizador de Espectro Neón Fluido
            FluidNeonSpectrumVisualizer(
                isPlaying = isPlaying,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp)
            )

            // Info de canción
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(track.title, color = TextPrimary, fontSize = 20.sp, maxLines = 1)
                Spacer(modifier = Modifier.height(4.dp))
                Text(track.artist + " · " + track.album, color = TextSecondary, fontSize = 13.sp, maxLines = 1)
            }

            // Controles de reproducción
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onPrev) {
                    Icon(Icons.Default.SkipPrevious, contentDescription = "Anterior", tint = TextPrimary, modifier = Modifier.size(36.dp))
                }

                FloatingActionButton(
                    onClick = onTogglePlay,
                    containerColor = VyBoraPurple,
                    contentColor = TextPrimary,
                    shape = CircleShape
                ) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                        contentDescription = "Play/Pause",
                        modifier = Modifier.size(32.dp)
                    )
                }

                IconButton(onClick = onNext) {
                    Icon(Icons.Default.SkipNext, contentDescription = "Siguiente", tint = TextPrimary, modifier = Modifier.size(36.dp))
                }
            }
        }
    }
}

@Composable
fun FluidNeonSpectrumVisualizer(
    isPlaying: Boolean,
    modifier: Modifier = Modifier
) {
    val transition = rememberInfiniteTransition(label = "neonSpectrum")
    val phase by transition.animateFloat(
        initialValue = 0f,
        targetValue = 6.28f,
        animationSpec = infiniteRepeatable(
            animation = tween(2400, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "phase"
    )

    Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height
        val points = 36
        val step = width / (points - 1)

        val path = Path()
        val fillPath = Path()

        for (i in 0 until points) {
            val normalized = if (isPlaying) {
                (sin(phase + i * 0.35f) * 0.4f + 0.5f).coerceIn(0.1f, 0.95f)
            } else 0.08f

            val x = i * step
            val y = height - (normalized * height * 0.85f)

            if (i == 0) {
                path.moveTo(x, y)
                fillPath.moveTo(0f, height)
                fillPath.lineTo(x, y)
            } else {
                path.lineTo(x, y)
                fillPath.lineTo(x, y)
            }
        }

        fillPath.lineTo(width, height)
        fillPath.close()

        // Relleno gradiente neón suave
        drawPath(
            path = fillPath,
            brush = Brush.verticalGradient(
                colors = listOf(VyBoraPurple.copy(alpha = 0.35f), VyBoraCyan.copy(alpha = 0.05f), AmoledBlack)
            )
        )

        // Trazo principal neón
        drawPath(
            path = path,
            color = VyBoraCyan,
            style = Stroke(width = 3.dp.toPx())
        )
    }
}
`
  },

  // 25. EqualizerScreen.kt
  {
    path: 'app/src/main/java/com/vybora/musicplayer/ui/screens/EqualizerScreen.kt',
    name: 'EqualizerScreen.kt',
    language: 'kotlin',
    description: 'Ecualizador de 5 bandas (60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz) con deslizadores de ganancia, Bass Boost y 3D Surround.',
    content: `package com.vybora.musicplayer.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vybora.musicplayer.ui.theme.*

@Composable
fun EqualizerScreen() {
    var isEnabled by remember { mutableStateOf(true) }
    var bassBoost by remember { mutableStateOf(65f) }
    var virtualizer by remember { mutableStateOf(40f) }

    val bandFrequencies = listOf("60 Hz", "230 Hz", "910 Hz", "3.6 kHz", "14 kHz")
    val bandLevels = remember { mutableStateListOf(4f, 2f, 0f, 3f, 5f) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AmoledBlack)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Ecualizador Gráfico DSP", color = TextPrimary, fontSize = 20.sp)
            Switch(
                checked = isEnabled,
                onCheckedChange = { isEnabled = it },
                colors = SwitchDefaults.colors(checkedThumbColor = VyBoraPurple)
            )
        }

        // Sliders de 5 bandas
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            color = AmoledCard,
            border = androidx.compose.foundation.BorderStroke(1.dp, AmoledCardBorder)
        ) {
            Row(
                modifier = Modifier
                    .padding(16.dp)
                    .fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                bandFrequencies.forEachIndexed { index, freq ->
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("\${bandLevels[index].toInt()} dB", color = VyBoraCyan, fontSize = 11.sp)
                        Slider(
                            value = bandLevels[index],
                            onValueChange = { bandLevels[index] = it },
                            valueRange = -10f..10f,
                            enabled = isEnabled,
                            colors = SliderDefaults.colors(thumbColor = VyBoraPurple, activeTrackColor = VyBoraPurple)
                        )
                        Text(freq, color = TextSecondary, fontSize = 10.sp)
                    }
                }
            }
        }

        // Bass Boost y Virtualizador
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            color = AmoledCard,
            border = androidx.compose.foundation.BorderStroke(1.dp, AmoledCardBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Column {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Bass Boost Profundo", color = TextPrimary, fontSize = 14.sp)
                        Text("\${bassBoost.toInt()}%", color = VyBoraPurple, fontSize = 14.sp)
                    }
                    Slider(
                        value = bassBoost,
                        onValueChange = { bassBoost = it },
                        valueRange = 0f..100f,
                        enabled = isEnabled,
                        colors = SliderDefaults.colors(thumbColor = VyBoraPurple, activeTrackColor = VyBoraPurple)
                    )
                }

                Column {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Virtualizador 3D Surround", color = TextPrimary, fontSize = 14.sp)
                        Text("\${virtualizer.toInt()}%", color = VyBoraCyan, fontSize = 14.sp)
                    }
                    Slider(
                        value = virtualizer,
                        onValueChange = { virtualizer = it },
                        valueRange = 0f..100f,
                        enabled = isEnabled,
                        colors = SliderDefaults.colors(thumbColor = VyBoraCyan, activeTrackColor = VyBoraCyan)
                    )
                }
            }
        }
    }
}
`
  },

  // 26. SettingsScreen.kt
  {
    path: 'app/src/main/java/com/vybora/musicplayer/ui/screens/SettingsScreen.kt',
    name: 'SettingsScreen.kt',
    language: 'kotlin',
    description: 'Ajustes con ficha oficial Acerca de VyBORA, créditos de Kenier Bravo y opciones de escaneo.',
    content: `package com.vybora.musicplayer.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vybora.musicplayer.ui.theme.*

@Composable
fun SettingsScreen(onRescanClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AmoledBlack)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Configuración", color = TextPrimary, fontSize = 22.sp)

        // Acerca de VyBORA
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            color = AmoledCard,
            border = androidx.compose.foundation.BorderStroke(1.dp, AmoledCardBorder)
        ) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Brush.linearGradient(listOf(VyBoraPurple, VyBoraCyan))),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("V", color = TextPrimary, fontSize = 24.sp)
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column {
                        Text("Acerca de VyBORA", color = TextPrimary, fontSize = 18.sp)
                        Text("Reproductor Musical Premium Android", color = TextSecondary, fontSize = 12.sp)
                    }
                }

                Divider(color = AmoledCardBorder)

                Text("Aplicación: VyBORA", color = TextPrimary, fontSize = 13.sp)
                Text("Creador: Kenier Bravo", color = VyBoraPurple, fontSize = 13.sp)
                Text("Versión: 1.0", color = VyBoraCyan, fontSize = 13.sp)
                Text("© 2026 Kenier Bravo. Todos los derechos reservados.", color = TextMuted, fontSize = 11.sp)
            }
        }

        // Botón de re-escaneo
        Button(
            onClick = onRescanClick,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = VyBoraPurple),
            shape = RoundedCornerShape(16.dp)
        ) {
            Icon(Icons.Default.Refresh, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Re-escanear Memoria Interna y Tarjetas SD")
        }
    }
}
`
  },

  // 27. MainActivity.kt
  {
    path: 'app/src/main/java/com/vybora/musicplayer/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    description: 'Actividad Principal de VyBORA con gestión de permisos Android 13+ (READ_MEDIA_AUDIO, RECORD_AUDIO), escaneo de MediaStore y MediaController.',
    content: `package com.vybora.musicplayer

import android.Manifest
import android.content.ComponentName
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.media3.common.MediaItem
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import com.google.common.util.concurrent.ListenableFuture
import com.google.common.util.concurrent.MoreExecutors
import com.vybora.musicplayer.data.AudioScanner
import com.vybora.musicplayer.data.MediaStoreAudioObserver
import com.vybora.musicplayer.data.NativeTrack
import com.vybora.musicplayer.data.ScannedLibrary
import com.vybora.musicplayer.playback.PlaybackService
import com.vybora.musicplayer.ui.screens.MainAppScreen
import com.vybora.musicplayer.ui.theme.VyBORATheme
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var controllerFuture: ListenableFuture<MediaController>
    private var mediaController: MediaController? = null
    private lateinit var audioScanner: AudioScanner
    private var mediaStoreObserver: MediaStoreAudioObserver? = null

    private val _libraryState = MutableStateFlow(ScannedLibrary())
    val libraryState = _libraryState.asStateFlow()

    private val _currentTrack = MutableStateFlow<NativeTrack?>(null)
    val currentTrack = _currentTrack.asStateFlow()

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying = _isPlaying.asStateFlow()

    private val requestPermissionsLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val audioGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions[Manifest.permission.READ_MEDIA_AUDIO] == true
        } else {
            permissions[Manifest.permission.READ_EXTERNAL_STORAGE] == true
        }

        if (audioGranted) {
            startAudioScan()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        audioScanner = AudioScanner(this)

        // Registrar observador de cambios en el almacenamiento de audio
        mediaStoreObserver = MediaStoreAudioObserver {
            startAudioScan()
        }
        contentResolver.registerContentObserver(
            android.provider.MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
            true,
            mediaStoreObserver!!
        )

        // Conectar servicio de reproducción Media3
        val sessionToken = SessionToken(this, ComponentName(this, PlaybackService::class.java))
        controllerFuture = MediaController.Builder(this, sessionToken).buildAsync()
        controllerFuture.addListener({
            try {
                mediaController = controllerFuture.get()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }, MoreExecutors.directExecutor())

        // Solicitar permisos requeridos
        checkAndRequestPermissions()

        setContent {
            VyBORATheme {
                val library by libraryState.collectAsState()
                val activeTrack by currentTrack.collectAsState()
                val playing by isPlaying.collectAsState()

                MainAppScreen(
                    library = library,
                    currentTrack = activeTrack,
                    isPlaying = playing,
                    onPlayTrack = { track -> playTrack(track) },
                    onTogglePlay = { togglePlay() },
                    onNext = { playNext() },
                    onPrev = { playPrev() },
                    onRescanClick = { startAudioScan() }
                )
            }
        }
    }

    private fun checkAndRequestPermissions() {
        val permissions = mutableListOf<String>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.READ_MEDIA_AUDIO)
            }
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        } else {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.READ_EXTERNAL_STORAGE)
            }
        }

        if (permissions.isNotEmpty()) {
            requestPermissionsLauncher.launch(permissions.toTypedArray())
        } else {
            startAudioScan()
        }
    }

    private fun startAudioScan() {
        lifecycleScope.launch {
            val scanned = audioScanner.scanDeviceAudio()
            _libraryState.value = scanned
            if (_currentTrack.value == null && scanned.tracks.isNotEmpty()) {
                _currentTrack.value = scanned.tracks.first()
            }
        }
    }

    private fun playTrack(track: NativeTrack) {
        _currentTrack.value = track
        mediaController?.let { controller ->
            val mediaItem = MediaItem.fromUri(track.contentUri)
            controller.setMediaItem(mediaItem)
            controller.prepare()
            controller.play()
            _isPlaying.value = true
        }
    }

    private fun togglePlay() {
        mediaController?.let { controller ->
            if (controller.isPlaying) {
                controller.pause()
                _isPlaying.value = false
            } else {
                controller.play()
                _isPlaying.value = true
            }
        }
    }

    private fun playNext() {
        val tracks = _libraryState.value.tracks
        val current = _currentTrack.value ?: return
        val idx = tracks.indexOfFirst { it.id == current.id }
        if (idx != -1 && tracks.isNotEmpty()) {
            val nextTrack = tracks[(idx + 1) % tracks.size]
            playTrack(nextTrack)
        }
    }

    private fun playPrev() {
        val tracks = _libraryState.value.tracks
        val current = _currentTrack.value ?: return
        val idx = tracks.indexOfFirst { it.id == current.id }
        if (idx != -1 && tracks.isNotEmpty()) {
            val prevIdx = if (idx - 1 < 0) tracks.size - 1 else idx - 1
            playTrack(tracks[prevIdx])
        }
    }

    override fun onDestroy() {
        mediaStoreObserver?.let { contentResolver.unregisterContentObserver(it) }
        MediaController.releaseFuture(controllerFuture)
        super.onDestroy()
    }
}
`
  },

  // 28. README_GOOGLE_PLAY.md
  {
    path: 'README_GOOGLE_PLAY.md',
    name: 'Guía Completa Android Studio & Google Play',
    language: 'markdown',
    description: 'Guía técnica para compilar APK Debug, generar AAB Release firmado y publicar en Google Play Store.',
    content: `# VyBORA — Proyecto Oficial Android Studio (Kotlin + Jetpack Compose)

- **Aplicación**: VyBORA
- **Creador**: Kenier Bravo
- **Versión**: 1.0 (Código de versión 1)
- **Namespace**: \`com.vybora.musicplayer\`
- **Copyright**: © 2026 Kenier Bravo. Todos los derechos reservados.

---

## 1. Arquitectura y Módulos
- **UI**: Jetpack Compose con Material 3 Dark AMOLED (\`#000000\`) y acentos Morado Neón (\`#A855F7\`) y Cian (\`#06B6D4\`).
- **Reproductor**: Android Media3 ExoPlayer 1.3.1 con servicio en segundo plano \`MediaSessionService\` y notificaciones en pantalla de bloqueo.
- **Escáner Automático**: \`AudioScanner.kt\` lee almacenamiento interno y ranuras de tarjetas MicroSD mediante \`MediaStore.Audio\`.
- **Actualización Automática**: \`MediaStoreAudioObserver.kt\` refresca la biblioteca automáticamente al añadir o borrar pistas.
- **Ecualizador DSP**: \`AudioEqualizerManager.kt\` con 5 bandas, Bass Boost y 3D Virtualizer.
- **Visualizador Neón**: \`VisualizerManager.kt\` captura FFT de audio en tiempo real y dibuja el espectro fluido.
- **Icono Adaptativo**: Configurado en \`res/mipmap-anydpi-v26/ic_launcher.xml\` con fondo negro AMOLED y el logotipo oficial de VyBORA.

---

## 2. Cómo Abrir y Compilar en Android Studio
1. Descomprime el archivo **vybora-android-studio-project.zip**.
2. Abre **Android Studio** (versión Iguana, Jellyfish o posterior).
3. Selecciona **Open** y navega hasta la carpeta descomprimida.
4. Espera a que Gradle sincronice las dependencias automáticamente usando Gradle 8.7 y Java 17.
5. Conecta tu teléfono Android o inicia un Emulador con Android 8.0 a Android 15.
6. Haz clic en **Run ▶ (Shift + F10)**.

---

## 3. Generar APK y AAB para Google Play Store
### A. Compilar APK de prueba (Debug)
\`\`\`bash
./gradlew assembleDebug
\`\`\`
El APK se genera en: \`app/build/outputs/apk/debug/app-debug.apk\`.

### B. Generar Android App Bundle (.aab) para Google Play
1. En Android Studio, ve a: **Build > Generate Signed Bundle / APK...**
2. Selecciona **Android App Bundle (.aab)** y haz clic en **Next**.
3. Selecciona o crea tu archivo keystore de firma privada.
4. Selecciona la variante **release**.
5. Haz clic en **Create**.
6. El archivo \`.aab\` generado estará listo para subir a la consola de **Google Play Console**.

---

## 4. Cómo Generar el APK Directamente desde el Teléfono (Sin PC)
Si no tienes una computadora a mano, puedes compilar e instalar el APK de VyBORA directamente usando **GitHub Actions**:
1. Entra a [github.com](https://github.com) desde el navegador de tu teléfono móvil y crea un nuevo repositorio (por ejemplo, \`vybora-app\`).
2. Sube la carpeta descomprimida del proyecto a tu repositorio.
3. Como el proyecto ya incluye el archivo \`.github/workflows/android-build.yml\`, GitHub detectará el flujo automáticamente y comenzará a compilar la aplicación en la nube.
4. Ve a la pestaña **Actions** en tu repositorio de GitHub.
5. Verás la ejecución **Compilar VyBORA APK y AAB**.
6. Al finalizar en verde (aproximadamente 2 minutos), ve a la sección inferior **Artifacts** y descarga **VyBORA-v1.0-APK-Debug**.
7. Descomprime y abre el archivo \`.apk\` en tu teléfono Android para instalar **VyBORA** de inmediato.
`
  }
];
