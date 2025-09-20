plugins {
    kotlin("jvm") version "1.9.21" // Or latest
    id("io.ktor.plugin") version "2.3.7" // Or latest
    kotlin("plugin.serialization") version "1.9.21" // For JSON
}

group = "com.qwishi"
version = "0.0.1"

androidx.compose.ui.window.application {
    mainClass.set("com.qwishi.ApplicationKt")
}

repositories {
    mavenCentral()
}

dependencies {
    // Ktor Core
    implementation("io.ktor:ktor-server-core-jvm")
    implementation("io.ktor:ktor-server-netty-jvm")
    implementation("io.ktor:ktor-server-content-negotiation-jvm")
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm")

    // Square SDK
    implementation("com.squareup:square:29.0.0.20230824") // Check for the latest version

    // Logging
    implementation("ch.qos.logback:logback-classic:1.4.11")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    // Ktor Auth (for API Key, if needed later)
    implementation("io.ktor:ktor-server-auth-jvm")
}
