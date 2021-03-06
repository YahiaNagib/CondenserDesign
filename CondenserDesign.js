
function Calculate() {

    var Heat_Duty = parseFloat(document.getElementById("HD").value)
        , OD = parseFloat(document.getElementById("TOD").value)
        , BWG = parseFloat(document.getElementById("BWG").value)
        , Tcw_in = parseFloat(document.getElementById("CWT").value)
        , Q_cw = parseFloat(document.getElementById("CWVF").value)
        , Condenser_pressure = parseFloat(document.getElementById("RBP").value)
        , spare_tubes = parseFloat(document.getElementById("PST").value)
        , S = parseFloat(document.getElementById("S").value)
        , V = parseFloat(document.getElementById("TV").value)
        , N_p = parseFloat(document.getElementById("NP").value)
        , Fc = parseFloat(document.getElementById("CF").value)
        , p_c1 = parseFloat(document.getElementById("PC1").value)
        , p_c2 = parseFloat(document.getElementById("PC2").value)
        , p_c3 = parseFloat(document.getElementById("PC3").value)
        , p_c4 = parseFloat(document.getElementById("PC4").value)
        , p_c5 = parseFloat(document.getElementById("PC5").value)
        , tube_material = document.getElementById("TM").value;


    var w = Get_water_prop(S, Heat_Duty, Q_cw, Tcw_in);
    var ro_cw = w.ro, cp_cw = w.cp;

    var bwg = {

        12: 0.109, 13: 0.095, 14: 0.083,
        15: 0.072, 16: 0.065, 17: 0.058,
        18: 0.049, 19: 0.042, 20: 0.035,
        21: 0.032, 22: 0.028, 23: 0.025,
        24: 0.022, 25: 0.02
    };

    var thickness = bwg[BWG];

    // console.log(tube_material);
    // console.log(cp_cw);

    var I_D = OD - 2 * thickness,
        N_tube = ((Q_cw / 3600) * N_p) / ((Math.PI / 4) * Math.pow(((25.4 * I_D) / 1000), 2) * V),
        N_tube_tot = N_tube * (1 + (spare_tubes / 100)),
        TR = (Math.pow(10, 9) * Heat_Duty / 3600) / ((Q_cw / 3600) * ro_cw * cp_cw),
        Tcw_out = Tcw_in + TR,
        P_cond_bara = Condenser_pressure / 750.06,
        Ts = 194.1 * Math.pow(P_cond_bara, 0.1405) - 94.64,
        TTD = Ts - Tcw_out,
        ITD = Ts - Tcw_in,
        LMTD = TR / Math.log(ITD / TTD);

    var U_uncorected = 0;
    if (OD == 0.625 || OD == 0.75) {

        U_uncorected = -156.2 * Math.pow(V, 2) + 1594 * V + 1315;
    }
    else if (OD == 0.875 || OD == 1) {
        U_uncorected = -156.4 * Math.pow(V, 2) + 1579 * V + 1286;
    }
    else if (OD == 1.125 || OD == 1.25) {
        U_uncorected = -158 * Math.pow(V, 2) + 1570 * V + 1253;
    }
    else if (OD == 1.375 || OD == 1.5) {
        U_uncorected = -154.9 * Math.pow(V, 2) + 1542 * V + 1238;
    }
    else if (OD == 1.625 || OD == 1.75) {
        U_uncorected = -156.4 * Math.pow(V, 2) + 1531 * V + 1208;
    }
    else if (OD == 1.875 || OD == 2) {
        U_uncorected = -154 * Math.pow(V, 2) + 1508 * V + 1189;
    }
    else {
        alert("TUBE OUTER DIAMTER IS NOT A STANDARD DIAMETER");
        return;
    }

    var p1 = -4.97e-09,
        p2 = 7.876e-07,
        p3 = -4.216e-05,
        p4 = 0.0006857,
        p5 = 0.01331,
        p6 = 0.67,
        Fw = p1 * Math.pow(Tcw_in, 5) + p2 * Math.pow(Tcw_in, 4) + p3 * Math.pow(Tcw_in, 3) + p4 * Math.pow(Tcw_in, 2) + p5 * Tcw_in + p6;


    var Fm = Fm_Calc(tube_material, BWG);


    var U_corrected = U_uncorected * Fw * Fm * Fc,
        A_surface = (Math.pow(10, 9) * Heat_Duty / 3600) / (LMTD * U_corrected),
        L_eff = (A_surface * N_p) / (Math.PI * (OD * 25.4 / 1000) * N_tube);

    var RT_R2 = (0.00642 * Math.pow((V * 3.2808399), 1.75)) / Math.pow(I_D, 1.25),
        T_mean = (Tcw_in + Tcw_out) / 2,
        R1 = 2.722e-09 * Math.pow(T_mean, 4) - 4.106e-07 * Math.pow(T_mean, 3) + 8.995e-05 * Math.pow(T_mean, 2) - 0.009245 * T_mean + 1.183,
        RT_tube = RT_R2 * R1 * (L_eff + 0.07);

    var RA = 0, RB = 0, RC = 0;
    if (N_p == 1) {
        RA = -0.0007508 * Math.pow(V, 3) + 0.1957 * Math.pow(V, 2) - 0.01777 * V + 0.008451;
        RB = -0.002214 * Math.pow(V, 3) + 0.1844 * Math.pow(V, 2) - 0.04873 * V + 0.0267;
        RC = 0.0001929 * Math.pow(V, 3) + 0.04873 * Math.pow(V, 2) - 0.004511 * V + 0.003469;
    }
    else if (N_p == 2) {
        RA = 0.007623 * Math.pow(V, 3) + 0.3491 * Math.pow(V, 2) + 0.02724 * V - 0.002695;
        RB = -0.001985 * Math.pow(V, 3) + 0.1889 * Math.pow(V, 2) - 0.06994 * V + 0.0465;
        RC = 0.001668 * Math.pow(V, 3) + 0.07064 * Math.pow(V, 2) + 0.02592 * V - 0.02054;
    }
    var RE = (RA + RB + RC) * 0.3048,
        RTT = RT_tube + RE;

    var TT = [p_c1, p_c2, p_c3, p_c4, p_c5];


    var Q_curves = 0, Psg = 0, Fw_new, TTD_performance = 0, Uo_new, LMTD_performance;
    var T_exit, TR_performance, T_steam, Back_Pressure;

    var dataArr = [], points, dataSet, chartData = [];

    for (var j = 0; j < TT.length; j++) {
        Psg = 0;

        for (var i = 0; i <= 1.2; i = i + 0.1) {
            Q_curves = i * (Math.pow(10, 9) * Heat_Duty / 3600);
            //Psg = Psg + 10;

            Fw_new = -4.97e-09 * Math.pow(TT[j], 5) + 7.876e-07 * Math.pow(TT[j], 4) - 4.216e-05 * Math.pow(TT[j], 3) + 0.0006857 * Math.pow(TT[j], 2) + 0.01331 * TT[j] + 0.67;
            Uo_new = (U_corrected / Fw) * Fw_new;
            LMTD_performance = Q_curves / (Uo_new * A_surface);
            T_exit = TT[j] + Q_curves / (ro_cw * cp_cw * Q_cw / 3600);
            TR_performance = T_exit - TT[j];
            TTD_performance = TR_performance / (-1 + Math.pow(Math.E, (TR_performance / LMTD_performance)));
            if ((TTD_performance < 2.7778) || Q_curves == 0) {
                TTD_performance = 2.7778;
            }
            T_steam = TT[j] + TR_performance + TTD_performance;
            Back_Pressure = (9.379e-09) * Math.pow(T_steam, 4) - (2.879e-07) * Math.pow(T_steam, 3) + (3.365e-05) * Math.pow(T_steam, 2) + 0.0001933 * T_steam + 0.006793;

            points = { label: Psg.toString(), y: Back_Pressure };
            dataArr.push(points);

            Psg = Psg + 10;

        }

        dataset = {
            type: "spline",
            name: TT[j].toString(),
            showInLegend: true,
            dataPoints: dataArr
        };

        chartData.push(dataset);

        dataArr = [];

    }



    var theData = {
        animationEnabled: true,
        exportEnabled: true,
        title: {
            text: "Condenser Performance Curves"
        },
        axisY: {
            title: "Back Pressure"
        },
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            // itemclick: toggleDataSeries
        },
        data: chartData
    };

    console.log(theData);




    var chart = new CanvasJS.Chart("chartContainer", theData);

    chart.render();






    document.getElementById("OHTC").value = U_corrected.toFixed(3);
    document.getElementById("SA").value = A_surface.toFixed(3);
    document.getElementById("TTQ").value = Math.ceil(N_tube_tot);
    document.getElementById("ETL").value = L_eff.toFixed(3);
    document.getElementById("PD").value = RTT.toFixed(3);
    document.getElementById("TR").value = TR.toFixed(3);
    document.getElementById("LMTD").value = LMTD.toFixed(3);



}

function Get_water_prop(S, Heat_Duty, Q_cw, Tcw_in) {

    var ro_cw_in = 1000, cp_cw_in = 4000, error1 = 1, error2 = 1,
        TR, Tcw_out, T, S_ppt, t68,
        A, B, C, D, A1, A2, A3, A4, c1, c2, c3, c4, c5, c6, c7, c8,
        F1, F2, F3, F4, F5, G1, G2, G3,
        ro_cw_calc = 1000, p0, cp_sw_P, Acp, Bcp, cp_sw_P0, cp_cw_calc = 1000;



    Q_cw = parseFloat(Q_cw); Tcw_in = parseFloat(Tcw_in);

    while (error1 > 0.00001 && error2 > 0.00001) {
        TR = (10 ** 9 * Heat_Duty / 3600) / ((Q_cw / 3600) * ro_cw_in * cp_cw_in);
        Tcw_out = Tcw_in + TR;
        T = 0.5 * (Tcw_in + Tcw_out);

        //t = T;
        S_ppt = S / 1000;
        t68 = 1.00024 * (T + 273.15);
        A = (2 * T - 200) / 160;
        B = (2 * S_ppt - 150) / 150;
        F1 = 0.5;
        F2 = A;
        F3 = (2 * A ** 2) - 1;
        F4 = (4 * A ** 3) - (3 * A);
        G1 = 0.5;
        G2 = B;
        G3 = (2 * B ** 2) - 1;
        A1 = 4.032219 * G1 + 0.115313 * G2 + (3.26e-4) * G3;
        A2 = -.108199 * G1 + (1.571e-3) * G2 - (4.23e-4) * G3;
        A3 = -.012247 * G1 + (1.74e-3) * G2 - (9e-6) * G3;
        A4 = (6.92e-4) * G1 - (8.7e-5) * G2 - (5.3e-5) * G3;
        ro_cw_calc = (A1 * F1 + A2 * F2 + A3 * F3 + A4 * F4) * 1000;
        c1 = -3.1118;
        c2 = 0.0157;
        c3 = 5.1014 * 10 ** (-5);
        c4 = -1.0302 * 10 ** (-6);
        c5 = 0.0107;
        c6 = -3.9716 * 10 ** (-5);
        c7 = 3.2088 * 10 ** (-8);
        c8 = 1.0119 * 10 ** (-9);
        p0 = (9.379e-09) * T ** 4 - (2.879e-07) * T ** 3 + (3.365e-05) * T ** 2 + 0.0001933 * T + 0.006793;
        cp_sw_P = (1.013 - p0) * (c1 + c2 * T + c3 * T ** 2 + c4 * T ** 3 + S_ppt * (c5 + c6 * T + c7 * T ** 2 + c8 * T ** 3));
        Acp = 5.328 - 9.76 * 10 ** (-2) * S_ppt + 4.04 * 10 ** (-4) * S_ppt ** 2;
        Bcp = -6.913 * 10 ** (-3) + 7.351 * 10 ** (-4) * (S_ppt) - 3.15 * 10 ** (-6) * S_ppt ** 2;
        C = 9.6 * 10 ** (-6) - 1.927 * 10 ** (-6) * (S_ppt) + 8.23 * 10 ** (-9) * S_ppt ** 2;
        D = 2.5 * 10 ** (-9) + 1.666 * 10 ** (-9) * (S_ppt) - 7.125 * 10 ** (-12) * S_ppt ** 2;
        cp_sw_P0 = 1000 * (Acp + Bcp * t68 + C * t68 ** 2 + D * t68 ** 3);
        cp_cw_calc = cp_sw_P0 + cp_sw_P;

        error1 = Math.abs(cp_cw_calc - cp_cw_in);
        error2 = Math.abs(ro_cw_calc - ro_cw_in);
        cp_cw_in = cp_cw_calc;
        ro_cw_in = ro_cw_calc;
    }

    var w = { cp: cp_cw_calc, ro: ro_cw_calc }

    return w;

}

function Fm_Calc(tube_material, BWG) {

    var Fm = 0;

    if (tube_material == 2) {
        Fm = -0.0002395 * Math.pow(BWG, 2) + 0.01223 * BWG + 0.8852;
    }
    else if (tube_material == 3) {
        Fm = -0.000334 * Math.pow(BWG, 2) + 0.01677 * BWG + 0.8267;
    }
    else if (tube_material == 4) {
        Fm = -0.0005168 * Math.pow(BWG, 2) + 0.02643 * BWG + 0.6905;
    }
    else if (tube_material == 5) {
        Fm = -0.0005633 * Math.pow(BWG, 2) + 0.02885 * BWG + 0.6569;
    }
    else if (tube_material == 6) {
        Fm = -0.0006635 * Math.pow(BWG, 2) + 0.03426 * BWG + 0.5779;
    }
    else if (tube_material == 7) {
        Fm = -0.0009067 * Math.pow(BWG, 2) + 0.04815 * BWG + 0.364;
    }
    else if (tube_material == 8) {
        Fm = -0.0009215 * Math.pow(BWG, 2) + 0.04934 * BWG + 0.3414;
    }
    else if (tube_material == 9) {
        Fm = -0.001108 * Math.pow(BWG, 2) + 0.06133 * BWG + 0.1336;
    }
    else if (tube_material == 10) {
        Fm = -0.001154 * Math.pow(BWG, 2) + 0.06549 * BWG + 0.04362;
    }
    else if (tube_material == 11) {
        Fm = -0.001166 * Math.pow(BWG, 2) + 0.06725 * BWG - 0.0001665;
    }
    else if (tube_material == 12) {
        Fm = -0.001191 * Math.pow(BWG, 2) + 0.07061 * BWG - 0.08678;
    }
    else if (tube_material == 13) {
        Fm = -0.001186 * Math.pow(BWG, 2) + 0.07094 * BWG - 0.1019;
    }
    else if (tube_material == 14) {
        Fm = -0.001141 * Math.pow(BWG, 2) + 0.07119 * BWG - 0.1542;
    }
    else if (tube_material == 15) {
        Fm = -0.001115 * Math.pow(BWG, 2) + 0.07079 * BWG - 0.1657;
    }
    else if (tube_material == 16) {
        Fm = -0.001063 * Math.pow(BWG, 2) + 0.07089 * BWG - 0.2252;
    }

    return Fm;
}


function Fill() {

    document.getElementById("HD").value = 2069;
    document.getElementById("TOD").value = 0.875;
    document.getElementById("BWG").value = 25;
    document.getElementById("CWT").value = 34;
    document.getElementById("CWVF").value = 76000;
    document.getElementById("RBP").value = 69.9;
    document.getElementById("PST").value = 1;
    document.getElementById("S").value = 41660;
    document.getElementById("TV").value = 2.288;
    document.getElementById("NP").value = 1;
    document.getElementById("CF").value = 0.92;
    document.getElementById("PC1").value = 21;
    document.getElementById("PC2").value = 27;
    document.getElementById("PC3").value = 31;
    document.getElementById("PC4").value = 34;
    document.getElementById("PC5").value = 36;
    document.getElementById("TM").value = "11";


}